import { Stage, StageFunction } from './Stage';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { BuildContext } from '../context/BuildContext';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import {
	extractProjectInfo,
	extractProjectType
} from '../context/contextExtraction';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import {
	isDocker,
	isMaven,
	isNpm,
	isRelease
} from '../context/projectTypeUtils';
import {
	NexusRepoGroupSearchFn,
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../services/NexusRepoApi';
import { NexusSearchResult } from '../services/NexusSearchResult';
import * as A from 'fp-ts/Array';

const isReleaseVersionUnique = (
	nexusResult: NexusSearchResult,
	version: string
): boolean =>
	pipe(
		nexusResult.items,
		A.filter((_) => _.version === version)
	).length === 0;

const validateReleaseVersion = (
	context: BuildContext,
	searchFn: NexusRepoGroupSearchFn
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		searchFn(context.projectInfo.group, context.projectInfo.name),
		TE.filterOrElse(
			(nexusResult) =>
				isReleaseVersionUnique(
					nexusResult,
					context.projectInfo.version
				),
			() => new Error('Project release version is not unique')
		),
		TE.map(() => context)
	);

const handleValidationByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: when(isMaven), projectInfo: when(isRelease) },
			(_) => validateReleaseVersion(_, searchForMavenReleases)
		)
		.with({ projectType: when(isNpm), projectInfo: when(isRelease) }, (_) =>
			validateReleaseVersion(_, searchForNpmReleases)
		)
		.with(
			{ projectType: when(isDocker), projectInfo: when(isRelease) },
			(_) => validateReleaseVersion(_, searchForDockerReleases)
		)
		.otherwise(() => TE.right(context));

const execute: StageFunction = (context) =>
	pipe(
		handleValidationByProject(context),
		TE.map(() => context)
	);

export const validateProjectVersionAllowed: Stage = {
	name: 'Validate Project Version Allowed',
	execute
};
