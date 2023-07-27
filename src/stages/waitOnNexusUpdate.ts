import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { wait } from '../utils/wait';
import { isApplication, isDocker, isHelm } from '../context/projectTypeUtils';
import { function as func } from 'fp-ts';
import { ProjectType } from '../context/ProjectType';
import { predicate } from 'fp-ts';
import { Stage, StageExecuteFn } from './Stage';
import { isKubernetesOnly, isTerraformOnly } from '../context/commandTypeUtils';
import { CommandType } from '../context/CommandType';

const WAIT_TIME_MILLIS = 3000;

const waitForNonDockerApplication = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		wait(WAIT_TIME_MILLIS),
		taskEither.fromTask,
		taskEither.map(() => context),
		taskEither.mapLeft(() => new Error('Error waiting on Nexus'))
	);

const isNonDockerNonHelmApplication: predicate.Predicate<ProjectType> =
	func.pipe(
		isApplication,
		predicate.and(predicate.not(isDocker)),
		predicate.and(predicate.not(isHelm))
	);
const isNotKuberntesOnly: predicate.Predicate<CommandType> =
	predicate.not(isKubernetesOnly);
const isNotTerraformOnly: predicate.Predicate<CommandType> =
	predicate.not(isTerraformOnly);

const handleWaitingByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: P.when(isNonDockerNonHelmApplication) },
			waitForNonDockerApplication
		)
		.run();

const execute: StageExecuteFn = (context) => handleWaitingByProject(context);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isNonDockerNonHelmApplication(_.projectType),
	predicate.and((_) => isNotKuberntesOnly(_.commandInfo.type)),
	predicate.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

export const waitOnNexusUpdate: Stage = {
	name: 'Wait On Nexus Update',
	execute,
	shouldStageExecute
};
