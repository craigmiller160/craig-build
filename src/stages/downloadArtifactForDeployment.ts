import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import {
	NexusRepoGroupSearchFn,
	searchForMavenReleases,
	searchForMavenSnapshots,
	searchForNpmBetas,
	searchForNpmReleases
} from '../services/NexusRepoApi';
import { isMaven, isNpm } from '../context/projectTypeUtils';
import { isPreRelease, isRelease } from '../context/projectInfoUtils';

const doDownloadArtifact = (
	context: BuildContext,
	searchFn: NexusRepoGroupSearchFn
): TE.TaskEither<Error, BuildContext> => {
	throw new Error();
};

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
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => downloadArtifactByProject(context);

export const downloadArtifactForDeployment: Stage = {
	name: 'Download Artifact For Deployment',
	execute
};
