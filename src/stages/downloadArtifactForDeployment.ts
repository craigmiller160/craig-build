import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import {
	downloadArtifact,
	NexusRepoGroupSearchFn,
	searchForMavenReleases,
	searchForMavenSnapshots,
	searchForNpmBetas,
	searchForNpmReleases
} from '../services/NexusRepoApi';
import {
	isApplication,
	isDocker,
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
import * as O from 'fp-ts/Option';
import { getCwd } from '../command/getCwd';
import { mkdir, rmDirIfExists } from '../functions/File';
import * as E from 'fp-ts/Either';
import * as P from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import { isKubernetesOnly } from '../context/commandTypeUtils';

const getExtension = (projectType: ProjectType): TE.TaskEither<Error, string> =>
	match(projectType)
		.with(when(isMaven), () => TE.right('jar'))
		.with(when(isNpm), () => TE.right('tgz'))
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
			{ projectType: when(isMaven), projectInfo: when(isPreRelease) },
			(_) => doDownloadArtifact(_, searchForMavenSnapshots)
		)
		.with(
			{ projectType: when(isMaven), projectInfo: when(isRelease) },
			(_) => doDownloadArtifact(_, searchForMavenReleases)
		)
		.with(
			{ projectType: when(isNpm), projectInfo: when(isPreRelease) },
			(_) => doDownloadArtifact(_, searchForNpmBetas)
		)
		.with({ projectType: when(isNpm), projectInfo: when(isRelease) }, (_) =>
			doDownloadArtifact(_, searchForNpmReleases)
		)
		.run();

const isNotDocker: P.Predicate<ProjectType> = P.not(isDocker);
const isNotKubernetesOnly: P.Predicate<CommandType> = P.not(isKubernetesOnly);

const execute: StageExecuteFn = (context) => downloadArtifactByProject(context);
const isNonDockerApplication: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isNotDocker(_.projectType),
	P.and((_) => isApplication(_.projectType))
);
const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	isNonDockerApplication,
	P.and((_) => isNotKubernetesOnly(_.commandInfo.type))
);

export const downloadArtifactForDeployment: Stage = {
	name: 'Download Artifact For Deployment',
	execute,
	shouldStageExecute
};
