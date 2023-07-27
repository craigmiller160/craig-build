import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { match, P } from 'ts-pattern';
import {
	downloadArtifact,
	NexusRepoGroupSearchFn,
	searchForMavenReleases,
	searchForMavenSnapshotsExplicit,
	searchForNpmBetas,
	searchForNpmReleases
} from '../services/NexusRepoApi';
import {
	isApplication,
	isDocker,
	isGradle,
	isHelm,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { isPreRelease, isRelease } from '../context/projectInfoUtils';
import { ProjectType } from '../context/ProjectType';
import { flow, pipe } from 'fp-ts/function';
import {
	NexusSearchResultAsset,
	NexusSearchResultItem
} from '../services/NexusSearchResult';
import { array } from 'fp-ts';
import { ProjectInfo } from '../context/ProjectInfo';
import path from 'path';
import { option } from 'fp-ts';
import { getCwd } from '../command/getCwd';
import { mkdir, rmDirIfExists } from '../functions/File';
import { either } from 'fp-ts';
import { predicate } from 'fp-ts';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import { isKubernetesOnly, isTerraformOnly } from '../context/commandTypeUtils';

const isMavenOrGradle: predicate.Predicate<ProjectType> = pipe(
	isMaven,
	predicate.or(isGradle)
);

const getExtension = (projectType: ProjectType): taskEither.TaskEither<Error, string> =>
	match(projectType)
		.when(isMavenOrGradle, () => taskEither.right('jar'))
		.when(isNpm, () => taskEither.right('tgz'))
		.otherwise(() =>
			taskEither.left(new Error(`No extension for ProjectType: ${projectType}`))
		);

const createTargetDirPath = () => path.join(getCwd(), 'deploy', 'build');

const createTargetDir = (): taskEither.TaskEither<Error, string> =>
func.pipe(
		either.right(createTargetDirPath()),
		either.bindTo('targetDir'),
		either.chainFirst(({ targetDir }) => rmDirIfExists(targetDir)),
		either.chain(({ targetDir }) => mkdir(targetDir)),
		taskEither.fromEither
	);

type GetFirstItem = (
	items: NexusSearchResultItem[]
) => taskEither.TaskEither<Error, NexusSearchResultItem>;
const getFirstItem: GetFirstItem = flow(
	A.head,
	taskEither.fromOption(() => new Error('No results for artifact search'))
);

const getDownloadUrl = (assets: NexusSearchResultAsset[], ext: string) =>
func.pipe(
		assets,
		A.findFirst((asset) => asset.downloadUrl.endsWith(ext)),
		option.map((asset) => asset.downloadUrl),
		taskEither.fromOption(
			() => new Error('Unable to find correct downloadUrl for artifact')
		)
	);

const createTargetFilePath = (
	projectInfo: ProjectInfo,
	ext: string
): taskEither.TaskEither<Error, string> =>
func.pipe(
		`${projectInfo.name}-${projectInfo.version}.${ext}`,
		(_) => path.join(createTargetDirPath(), _),
		taskEither.right
	);

// TODO baseVersion does not work for maven, version does

const doDownloadArtifact = (
	context: BuildContext,
	searchFn: NexusRepoGroupSearchFn
): taskEither.TaskEither<Error, BuildContext> =>
func.pipe(
		createTargetDir(),
		taskEither.chain(() => getExtension(context.projectType)),
		taskEither.bindTo('ext'),
		taskEither.bind('result', () =>
			searchFn(
				context.projectInfo.group,
				context.projectInfo.name,
				context.projectInfo.version
			)
		),
		taskEither.bind('firstItem', ({ result }) => getFirstItem(result.items)),
		taskEither.bind('downloadUrl', ({ firstItem, ext }) =>
			getDownloadUrl(firstItem.assets, ext)
		),
		taskEither.bind('targetFilePath', ({ ext }) =>
			createTargetFilePath(context.projectInfo, ext)
		),
		taskEither.chain(({ downloadUrl, targetFilePath }) =>
			downloadArtifact(downloadUrl, targetFilePath)
		),
		taskEither.map(() => context)
	);

const downloadArtifactByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{
				projectType: P.when(isMavenOrGradle),
				projectInfo: P.when(isPreRelease)
			},
			(_) => doDownloadArtifact(_, searchForMavenSnapshotsExplicit)
		)
		.with(
			{
				projectType: P.when(isMavenOrGradle),
				projectInfo: P.when(isRelease)
			},
			(_) => doDownloadArtifact(_, searchForMavenReleases)
		)
		.with(
			{ projectType: P.when(isNpm), projectInfo: P.when(isPreRelease) },
			(_) => doDownloadArtifact(_, searchForNpmBetas)
		)
		.with(
			{ projectType: P.when(isNpm), projectInfo: P.when(isRelease) },
			(_) => doDownloadArtifact(_, searchForNpmReleases)
		)
		.run();

const isNotDocker: predicate.Predicate<ProjectType> = predicate.not(isDocker);
const isNotKubernetesOnly: predicate.Predicate<CommandType> =
	predicate.not(isKubernetesOnly);
const isNotTerraformOnly: predicate.Predicate<CommandType> =
	predicate.not(isTerraformOnly);

const execute: StageExecuteFn = (context) => downloadArtifactByProject(context);
const isNonDockerNonHelmApplication: predicate.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isNotDocker(_.projectType),
	predicate.and(predicate.not((_) => isHelm(_.projectType))),
	predicate.and((_) => isApplication(_.projectType))
);
const shouldStageExecute: predicate.Predicate<BuildContext> = pipe(
	isNonDockerNonHelmApplication,
	predicate.and((_) => isNotKubernetesOnly(_.commandInfo.type)),
	predicate.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

export const downloadArtifactForDeployment: Stage = {
	name: 'Download Artifact For Deployment',
	execute,
	shouldStageExecute
};
