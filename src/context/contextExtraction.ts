import * as E from 'fp-ts/Either';
import { BuildToolInfo } from './BuildToolInfo';
import { pipe } from 'fp-ts/function';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { IncompleteBuildContext } from './IncompleteBuildContext';

// TODO consider deleting all of these if unnecessary

export const extractBuildToolInfo = (
	context: IncompleteBuildContext
): E.Either<Error, BuildToolInfo> =>
	pipe(
		context.buildToolInfo,
		E.fromOption(() => new Error('BuildContext is missing BuildToolInfo'))
	);

export const extractProjectType = (
	context: IncompleteBuildContext
): E.Either<Error, ProjectType> =>
	pipe(
		context.projectType,
		E.fromOption(() => new Error('BuildContext is missing ProjectType'))
	);

export const extractProjectInfo = (
	context: IncompleteBuildContext
): E.Either<Error, ProjectInfo> =>
	pipe(
		context.projectInfo,
		E.fromOption(() => new Error('BuildContext is missing ProjectInfo'))
	);
