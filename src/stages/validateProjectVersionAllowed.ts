import { BuildContext } from '../context/BuildContext';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { isDocker, isJvm, isNpm } from '../context/projectTypeUtils';
import {
	NexusRepoGroupSearchFn,
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../services/NexusRepoApi';
import { NexusSearchResult } from '../services/NexusSearchResult';
import * as A from 'fp-ts/Array';
import { isRelease } from '../context/projectInfoUtils';
import { Stage, StageExecuteFn } from './Stage';
import * as P from 'fp-ts/Predicate';
import { isDockerOnly, isFullBuild } from '../context/commandTypeUtils';

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
		.with({ projectType: when(isJvm), projectInfo: when(isRelease) }, (_) =>
			validateReleaseVersion(_, searchForMavenReleases)
		)
		.with({ projectType: when(isNpm), projectInfo: when(isRelease) }, (_) =>
			validateReleaseVersion(_, searchForNpmReleases)
		)
		.with(
			{ projectType: when(isDocker), projectInfo: when(isRelease) },
			(_) => validateReleaseVersion(_, searchForDockerReleases)
		)
		.run();

const execute: StageExecuteFn = (context) =>
	pipe(
		handleValidationByProject(context),
		TE.map(() => context)
	);

const isFullBuildAndRelease: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isRelease(_.projectInfo),
	P.and((_) => isFullBuild(_.commandInfo.type))
);

const isDockerOnlyAndDockerProjectAndRelease: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isDockerOnly(_.commandInfo.type),
	P.and((_) => isDocker(_.projectType)),
	P.and((_) => isRelease(_.projectInfo))
);

const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	isFullBuildAndRelease,
	P.or(isDockerOnlyAndDockerProjectAndRelease)
);

export const validateProjectVersionAllowed: Stage = {
	name: 'Validate Project Version Allowed',
	execute,
	shouldStageExecute
};
