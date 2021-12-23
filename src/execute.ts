import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { BaseStage, EarlyStage, Stage } from './stages/Stage';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { logger } from './logger';
import { EARLY_STAGES, STAGES } from './stages';
import * as EU from './functions/EitherUtils';
import { stringifyJson } from './functions/Json';
import { toLoggable } from './context/LoggableIncompleteBuildContext';
import { IncompleteBuildContext } from './context/IncompleteBuildContext';

const executeStage = (
	contextTE: TE.TaskEither<Error, BuildContext>,
	stage: Stage
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		contextTE,
		TE.chain((context) => {
			logger.info(`Starting stage: ${stage.name}`);
			return pipe(
				stage.execute(context),
				TE.map((_) => {
					logger.info(
						`Completed stage: ${stage.name} ${EU.getOrThrow(
							stringifyJson(toLoggable(_), 2)
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
		})
	);

const executeStages = (
	stages: BaseStage<any, any>[]
): TE.TaskEither<any, any> => pipe(stages, A.reduce());

const executeEarlyStages = (
	context: IncompleteBuildContext
): TE.TaskEither<Error, IncompleteBuildContext> =>
	pipe(
		EARLY_STAGES,
		A.reduce(
			TE.right<Error, IncompleteBuildContext>(context),
			(ctxTE, stage: EarlyStage) => {
				return ctxTE;
			}
		)
	);

export const execute = (
	context: IncompleteBuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		STAGES,
		A.reduce(
			TE.right<Error, BuildContext>(context),
			(ctxTE, stage: Stage) => executeStage(ctxTE, stage)
		)
	);
