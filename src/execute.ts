import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { BaseStage, BaseStageFunction } from './stages/Stage';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { logger } from './logger';
import { EARLY_STAGES, STAGES } from './stages';
import * as EU from './functions/EitherUtils';
import { stringifyJson } from './functions/Json';
import { IncompleteBuildContext } from './context/IncompleteBuildContext';
import { Context } from './context/Context';
import { toLoggableContext } from './context/contextLogging';
import { fromIncompleteContext } from './context/fromIncompleteContext';

const executeStage = <
	Ctx extends Context,
	StageFn extends BaseStageFunction<Ctx>
>(
	contextTE: TE.TaskEither<Error, Ctx>,
	stage: BaseStage<Ctx, StageFn>
) =>
	pipe(
		contextTE,
		TE.chain((context) => {
			logger.info(`Starting stage: ${stage.name}`);
			return pipe(
				stage.execute(context),
				TE.map((_) => {
					logger.info(
						`Completed stage: ${stage.name} ${EU.getOrThrow(
							stringifyJson(toLoggableContext(_), 2)
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

const executeAllStages = <
	Ctx extends Context,
	StageFn extends BaseStageFunction<Ctx>
>(
	context: Ctx,
	stages: BaseStage<Ctx, StageFn>[]
): TE.TaskEither<Error, Ctx> =>
	pipe(
		stages,
		A.reduce(TE.right<Error, Ctx>(context), (ctxTE, stage) =>
			executeStage(ctxTE, stage)
		)
	);

const incompleteToCompleteContext = (
	context: IncompleteBuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(fromIncompleteContext(context), TE.fromEither);

export const execute = (
	context: IncompleteBuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		executeAllStages(context, EARLY_STAGES),
		TE.chain(incompleteToCompleteContext),
		TE.chain((_) => executeAllStages(_, STAGES))
	);
