import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { match, when } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

const validateConfig = (
	context: BuildContext
): E.Either<Error, BuildContext> => {
	throw new Error();
};

const validateConfigByProject = (
	context: BuildContext
): E.Either<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isApplication) }, validateConfig)
		.otherwise(E.right);

const execute: StageFunction = (context) =>
	pipe(validateConfigByProject(context), TE.fromEither);

export const validateKubernetesConfig: Stage = {
	name: 'Validate Kubernetes Config',
	execute
};
