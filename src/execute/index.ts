import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { logger } from '../logger';
import * as EU from '../functions/EitherUtils';
import { stringifyJson } from '../functions/Json';
import { stages } from '../stages';
import { Stage } from '../stages/Stage';
import {
	createStageExecution,
	executeIfAllowed,
	proceedIfCommandAllows,
	proceedIfProjectAllows
} from './stageExecutionUtils';

const conditionallyExecuteStage = (
	context: BuildContext,
	stage: Stage
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		createStageExecution(stage, context),
		proceedIfCommandAllows,
		proceedIfProjectAllows,
		executeIfAllowed
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
		TE.chain((_) => conditionallyExecuteStage(_, stage)),
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

export const execute = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		stages,
		A.reduce(TE.right<Error, BuildContext>(context), (ctxTE, stage) =>
			executeStage(ctxTE, stage)
		)
	);
