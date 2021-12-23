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

interface ExtractedValues {
	readonly projectType: ProjectType;
	readonly projectInfo: ProjectInfo;
}

const isReleaseVersionUnique = (
	nexusResult: NexusSearchResult,
	version: string
): boolean =>
	pipe(
		nexusResult.items,
		A.filter((_) => _.version === version)
	).length === 0;

const validateReleaseVersion = (
	values: ExtractedValues,
	searchFn: NexusRepoGroupSearchFn
): TE.TaskEither<Error, ExtractedValues> =>
	pipe(
		searchFn(values.projectInfo.group, values.projectInfo.name),
		TE.filterOrElse(
			(nexusResult) =>
				isReleaseVersionUnique(nexusResult, values.projectInfo.version),
			() => new Error('Project release version is not unique')
		),
		TE.map(() => values)
	);

const extractValues = (
	context: BuildContext
): E.Either<Error, ExtractedValues> =>
	pipe(
		extractProjectType(context),
		E.chain((projectType) =>
			pipe(
				extractProjectInfo(context),
				E.map(
					(projectInfo): ExtractedValues => ({
						projectType,
						projectInfo
					})
				)
			)
		)
	);

const handleValidationByProject = (
	values: ExtractedValues
): TE.TaskEither<Error, ExtractedValues> =>
	match(values)
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
		.otherwise(() => TE.right(values));

const execute: StageFunction = (context) =>
	pipe(
		extractValues(context),
		TE.fromEither,
		TE.chain(handleValidationByProject),
		TE.map(() => context)
	);

export const validateProjectVersionAllowed: Stage = {
	name: 'Validate Project Version Allowed',
	execute
};
