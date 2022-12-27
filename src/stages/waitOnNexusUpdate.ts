import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import { wait } from '../utils/wait';
import { isApplication, isDocker, isHelm } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
import { ProjectType } from '../context/ProjectType';
import * as Pred from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { isKubernetesOnly } from '../context/commandTypeUtils';
import { CommandType } from '../context/CommandType';

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

const isNonDockerNonHelmApplication: Pred.Predicate<ProjectType> = pipe(
	isApplication,
	Pred.and(Pred.not(isDocker)),
	Pred.and(Pred.not(isHelm))
);
const isNotKuberntesOnly: Pred.Predicate<CommandType> =
	Pred.not(isKubernetesOnly);

const handleWaitingByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: P.when(isNonDockerNonHelmApplication) },
			waitForNonDockerApplication
		)
		.run();

const execute: StageExecuteFn = (context) => handleWaitingByProject(context);
const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isNonDockerNonHelmApplication(_.projectType),
	Pred.and((_) => isNotKuberntesOnly(_.commandInfo.type))
);

export const waitOnNexusUpdate: Stage = {
	name: 'Wait On Nexus Update',
	execute,
	shouldStageExecute
};
