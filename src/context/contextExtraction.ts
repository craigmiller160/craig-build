import { BuildContext } from './BuildContext';
import * as E from 'fp-ts/Either';
import { BuildToolInfo } from './BuildToolInfo';
import { pipe } from 'fp-ts/function';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export const extractBuildToolInfo = (
	context: BuildContext
): E.Either<Error, BuildToolInfo> =>
	pipe(
		context.buildToolInfo,
		E.fromOption(() => new Error('BuildContext is missing BuildToolInfo'))
	);

export const extractProjectType = (
	context: BuildContext
): E.Either<Error, ProjectType> =>
	pipe(
		context.projectType,
		E.fromOption(() => new Error('BuildContext is missing ProjectType'))
	);

export const extractProjectInfo = (
	context: BuildContext
): E.Either<Error, ProjectInfo> =>
	pipe(
		context.projectInfo,
		E.fromOption(() => new Error('BuildContext is missing ProjectInfo'))
	);
