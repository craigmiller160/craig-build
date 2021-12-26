import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { wait } from '../utils/wait';
import { isApplication, isDocker } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
import { ProjectType } from '../context/ProjectType';
import * as P from 'fp-ts/Predicate';

const WAIT_TIME_MILLIS = 3000;

const waitForNonDockerApplication = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		wait(WAIT_TIME_MILLIS),
		TE.fromTask,
		TE.map(() => context),
		TE.mapLeft(() => new Error('Error waiting on Nexus'))
	);

const isNonDockerApplication: P.Predicate<ProjectType> = pipe(
	isApplication,
	P.and(P.not(isDocker))
);

const handleWaitingByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: when(isNonDockerApplication) },
			waitForNonDockerApplication
		)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handleWaitingByProject(context);

export const waitOnNexusUpdate: Stage = {
	name: 'Wait On Nexus Update',
	execute
};
