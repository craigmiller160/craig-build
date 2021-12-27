import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isApplication } from '../context/projectTypeUtils';

const doDeploy = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	throw new Error();
};

const handleDeployByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isApplication) }, doDeploy)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handleDeployByProject(context);

export const deployToKubernetes: Stage = {
	name: 'Deploy to Kubernetes',
	execute
};
