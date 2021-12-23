import { Stage, StageFunction } from './Stage';
import * as E from 'fp-ts/Either';
import { ProjectInfo } from '../context/ProjectInfo';
import { ProjectType } from '../context/ProjectType';
import { BuildContext } from '../context/BuildContext';
import {
	extractProjectInfo,
	extractProjectType
} from '../context/contextExtraction';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { isMaven, isNpm } from '../context/projectTypeUtils';
import { logger } from '../logger';
import * as TE from 'fp-ts/TaskEither';

interface ExtractedValues {
	projectType: ProjectType;
	isPreRelease: boolean;
}

const validateMavenReleaseDependencies = (): E.Either<Error, null> => {
	throw new Error();
};

const validateNpmReleaseDependencies = (): E.Either<Error, null> => {
	throw new Error();
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
						isPreRelease: projectInfo.isPreRelease
					})
				)
			)
		)
	);

const handleValidationByProject = (
	values: ExtractedValues
): E.Either<Error, null> =>
	match(values)
		.with(
			{ projectType: when(isMaven), isPreRelease: true },
			validateMavenReleaseDependencies
		)
		.with(
			{ projectType: when(isNpm), isPreRelease: true },
			validateNpmReleaseDependencies
		)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return E.right(null);
		});

const execute: StageFunction = (context) =>
	pipe(
		extractValues(context),
		E.chain(handleValidationByProject),
		E.map(() => context),
		TE.fromEither
	);

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute
};
