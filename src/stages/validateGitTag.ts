import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

const handleValidationByProject = (
	context: BuildContext
): E.Either<Error, BuildContext> => {
	throw new Error();
};

const execute: StageFunction = (context) =>
	pipe(handleValidationByProject(context), TE.fromEither);

export const validateGitTag: Stage = {
	name: 'Validate Git Tag',
	execute
};
