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

interface ExtractedValues {
	projectType: ProjectType;
	projectInfo: ProjectInfo;
}

const validateMavenReleaseVersion = (
	values: ExtractedValues
): E.Either<Error, ExtractedValues> => {
	return E.right(values);
};

const validateNpmReleaseVersion = (
	values: ExtractedValues
): E.Either<Error, ExtractedValues> => {
	return E.right(values);
};

const validateDockerReleaseVersion = (
	values: ExtractedValues
): E.Either<Error, ExtractedValues> => {
	return E.right(values);
};

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
): E.Either<Error, ExtractedValues> =>
	match(values)
		.with(
			{ projectType: when(isMaven), projectInfo: when(isRelease) },
			validateMavenReleaseVersion
		)
		.with(
			{ projectType: when(isNpm), projectInfo: when(isRelease) },
			validateNpmReleaseVersion
		)
		.with(
			{ projectType: when(isDocker), projectInfo: when(isRelease) },
			validateDockerReleaseVersion
		)
		.otherwise(() => E.right(values));

const execute: StageFunction = (context) =>
	pipe(
		extractValues(context),
		E.chain(handleValidationByProject),
		E.map(() => context),
		TE.fromEither
	);

export const validateProjectVersionAllowed: Stage = {
	name: 'Validate Project Version Allowed',
	execute
};
