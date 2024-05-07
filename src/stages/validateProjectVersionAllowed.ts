import { BuildContext } from '../context/BuildContext';
import { function as func } from 'fp-ts';
import { taskEither, readonlyArray } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isDocker, isHelm, isJvm, isNpm } from '../context/projectTypeUtils';
import {
	NexusRepoGroupSearchFn,
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../services/NexusRepoApi';
import { NexusSearchResult } from '../services/NexusSearchResult';
import { array } from 'fp-ts';
import { isRelease } from '../context/projectInfoUtils';
import { Stage, StageExecuteFn } from './Stage';
import { predicate } from 'fp-ts';
import { isDockerOnly, isFullBuild } from '../context/commandTypeUtils';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';

const isReleaseVersionUnique = (
	nexusResult: NexusSearchResult,
	version: string
): boolean =>
	func.pipe(
		nexusResult.items,
		array.filter((_) => _.version === version)
	).length === 0;

const doReleaseVersionValidation =
	(searchFn: NexusRepoGroupSearchFn) =>
	(projectInfo: ProjectInfo): taskEither.TaskEither<Error, ProjectInfo> =>
		func.pipe(
			searchFn(projectInfo.group, projectInfo.name),
			taskEither.filterOrElse(
				(nexusResult) =>
					isReleaseVersionUnique(nexusResult, projectInfo.version),
				() => new Error('Project release version is not unique')
			),
			taskEither.map(() => projectInfo)
		);

const validateReleaseVersion = (
	context: BuildContext,
	searchFn: NexusRepoGroupSearchFn
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		context.projectInfo.monorepoChildren ?? [context.projectInfo],
		readonlyArray.map(doReleaseVersionValidation(searchFn)),
		taskEither.sequenceArray,
		taskEither.map(() => context)
	);

const handleValidationByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: P.when(isJvm), projectInfo: P.when(isRelease) },
			(_) => validateReleaseVersion(_, searchForMavenReleases)
		)
		.with(
			{ projectType: P.when(isNpm), projectInfo: P.when(isRelease) },
			(_) => validateReleaseVersion(_, searchForNpmReleases)
		)
		.with(
			{ projectType: P.when(isDocker), projectInfo: P.when(isRelease) },
			(_) => validateReleaseVersion(_, searchForDockerReleases)
		)
		.run();

const execute: StageExecuteFn = (context) =>
	func.pipe(
		handleValidationByProject(context),
		taskEither.map(() => context)
	);

const isNotHelm: predicate.Predicate<ProjectType> = predicate.not(isHelm);

const isNonHelmFullBuildAndRelease: predicate.Predicate<BuildContext> =
	func.pipe(
		(_: BuildContext) => isRelease(_.projectInfo),
		predicate.and((_) => isFullBuild(_.commandInfo.type)),
		predicate.and((_) => isNotHelm(_.projectType))
	);

const isDockerOnlyAndDockerProjectAndRelease: predicate.Predicate<BuildContext> =
	func.pipe(
		(_: BuildContext) => isDockerOnly(_.commandInfo.type),
		predicate.and((_) => isDocker(_.projectType)),
		predicate.and((_) => isRelease(_.projectInfo))
	);

const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	isNonHelmFullBuildAndRelease,
	predicate.or(isDockerOnlyAndDockerProjectAndRelease)
);

export const validateProjectVersionAllowed: Stage = {
	name: 'Validate Project Version Allowed',
	execute,
	shouldStageExecute
};
