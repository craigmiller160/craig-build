import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { array } from 'fp-ts';
import { function as func } from 'fp-ts';
import { logger } from '../logger';
import * as EU from '../functions/EitherUtils';
import { stringifyJson } from '../functions/Json';
import { stages } from '../stages';
import { Stage } from '../stages/Stage';
import {
	createStageExecution,
	executeIfAllowed,
	shouldStageExecute
} from './stageExecutionUtils';

const conditionallyExecuteStage = (
	context: BuildContext,
	stage: Stage
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		createStageExecution(stage),
		shouldStageExecute(context),
		executeIfAllowed(context),
		taskEither.map((_) => {
			logger.info(
				`Completed stage: ${stage.name} ${EU.getOrThrow(
					stringifyJson(_, 2)
				)}`
			);
			return _;
		}),
		taskEither.mapLeft((_) => {
			logger.error(`Error in stage: ${stage.name}`);
			logger.error(_);
			return _;
		})
	);

const executeStage = (
	contextTE: taskEither.TaskEither<Error, BuildContext>,
	stage: Stage
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		contextTE,
		taskEither.map((_) => {
			logger.info(`Starting stage: ${stage.name}`);
			return _;
		}),
		taskEither.chain((_) => conditionallyExecuteStage(_, stage))
	);

export const execute = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		stages,
		array.reduce(
			taskEither.right<Error, BuildContext>(context),
			(ctxTE, stage) => executeStage(ctxTE, stage)
		)
	);
