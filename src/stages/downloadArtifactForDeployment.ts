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
import * as A from 'fp-ts/Array';
import { ProjectInfo } from '../context/ProjectInfo';
import path from 'path';
import { option } from 'fp-ts';
import { getCwd } from '../command/getCwd';
import { mkdir, rmDirIfExists } from '../functions/File';
import { either } from 'fp-ts';
import * as Pred from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import { isKubernetesOnly, isTerraformOnly } from '../context/commandTypeUtils';

const isMavenOrGradle: Pred.Predicate<ProjectType> = pipe(
	isMaven,
	Pred.or(isGradle)
);

const getExtension = (projectType: ProjectType): TE.TaskEither<Error, string> =>
	match(projectType)
		.when(isMavenOrGradle, () => TE.right('jar'))
		.when(isNpm, () => TE.right('tgz'))
		.otherwise(() =>
			TE.left(new Error(`No extension for ProjectType: ${projectType}`))
		);

const createTargetDirPath = () => path.join(getCwd(), 'deploy', 'build');

const createTargetDir = (): TE.TaskEither<Error, string> =>
	pipe(
		E.right(createTargetDirPath()),
		E.bindTo('targetDir'),
		E.chainFirst(({ targetDir }) => rmDirIfExists(targetDir)),
		E.chain(({ targetDir }) => mkdir(targetDir)),
		TE.fromEither
	);

type GetFirstItem = (
	items: NexusSearchResultItem[]
) => TE.TaskEither<Error, NexusSearchResultItem>;
const getFirstItem: GetFirstItem = flow(
	A.head,
	TE.fromOption(() => new Error('No results for artifact search'))
);

const getDownloadUrl = (assets: NexusSearchResultAsset[], ext: string) =>
	pipe(
		assets,
		A.findFirst((asset) => asset.downloadUrl.endsWith(ext)),
		O.map((asset) => asset.downloadUrl),
		TE.fromOption(
			() => new Error('Unable to find correct downloadUrl for artifact')
		)
	);

const createTargetFilePath = (
	projectInfo: ProjectInfo,
	ext: string
): TE.TaskEither<Error, string> =>
	pipe(
		`${projectInfo.name}-${projectInfo.version}.${ext}`,
		(_) => path.join(createTargetDirPath(), _),
		TE.right
	);

// TODO baseVersion does not work for maven, version does

const doDownloadArtifact = (
	context: BuildContext,
	searchFn: NexusRepoGroupSearchFn
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		createTargetDir(),
		TE.chain(() => getExtension(context.projectType)),
		TE.bindTo('ext'),
		TE.bind('result', () =>
			searchFn(
				context.projectInfo.group,
				context.projectInfo.name,
				context.projectInfo.version
			)
		),
		TE.bind('firstItem', ({ result }) => getFirstItem(result.items)),
		TE.bind('downloadUrl', ({ firstItem, ext }) =>
			getDownloadUrl(firstItem.assets, ext)
		),
		TE.bind('targetFilePath', ({ ext }) =>
			createTargetFilePath(context.projectInfo, ext)
		),
		TE.chain(({ downloadUrl, targetFilePath }) =>
			downloadArtifact(downloadUrl, targetFilePath)
		),
		TE.map(() => context)
	);

const downloadArtifactByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
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

const isNotDocker: Pred.Predicate<ProjectType> = Pred.not(isDocker);
const isNotKubernetesOnly: Pred.Predicate<CommandType> =
	Pred.not(isKubernetesOnly);
const isNotTerraformOnly: Pred.Predicate<CommandType> =
	Pred.not(isTerraformOnly);

const execute: StageExecuteFn = (context) => downloadArtifactByProject(context);
const isNonDockerNonHelmApplication: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isNotDocker(_.projectType),
	Pred.and(Pred.not((_) => isHelm(_.projectType))),
	Pred.and((_) => isApplication(_.projectType))
);
const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	isNonDockerNonHelmApplication,
	Pred.and((_) => isNotKubernetesOnly(_.commandInfo.type)),
	Pred.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

export const downloadArtifactForDeployment: Stage = {
	name: 'Download Artifact For Deployment',
	execute,
	shouldStageExecute
};
