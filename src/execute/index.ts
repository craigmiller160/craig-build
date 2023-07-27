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
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		createStageExecution(stage),
		shouldStageExecute(context),
		executeIfAllowed(context),
		TE.map((_) => {
			logger.info(
				`Completed stage: ${stage.name} ${EU.getOrThrow(
					stringifyJson(_, 2)
				)}`
			);
			return _;
		}),
		TE.mapLeft((_) => {
			logger.error(`Error in stage: ${stage.name}`);
			logger.error(_);
			return _;
		})
	);

const executeStage = (
	contextTE: TE.TaskEither<Error, BuildContext>,
	stage: Stage
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		contextTE,
		TE.map((_) => {
			logger.info(`Starting stage: ${stage.name}`);
			return _;
		}),
		TE.chain((_) => conditionallyExecuteStage(_, stage))
	);

export const execute = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		stages,
		A.reduce(TE.right<Error, BuildContext>(context), (ctxTE, stage) =>
			executeStage(ctxTE, stage)
		)
	);
