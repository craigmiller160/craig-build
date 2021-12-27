import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { logger } from './logger';
import { setupStages, conditionalStages } from './stages';
import * as EU from './functions/EitherUtils';
import { stringifyJson } from './functions/Json';
import { IncompleteBuildContext } from './context/IncompleteBuildContext';
import { Context } from './context/Context';
import { toLoggableContext } from './context/toLoggableContext';
import { fromIncompleteContext } from './context/fromIncompleteContext';
import { BaseStage, ConditionalStage } from './stages/Stage';
import * as P from 'fp-ts/Predicate';
import { match, when } from 'ts-pattern';

const isConditionalStage = (stage: BaseStage<any>): stage is ConditionalStage =>
	(stage as any).commandAllowsStage !== undefined;

const shouldStageRun = <Ctx extends Context>(
	context: Ctx,
	stage: BaseStage<Ctx>
): boolean =>
	match(stage)
		.with(when(isConditionalStage), (_: ConditionalStage) =>
			pipe(
				_.commandAllowsStage,
				P.and(_.projectAllowsStage)
			)(context as unknown as BuildContext)
		)
		.otherwise(() => true);

const executeStage = <Ctx extends Context>(
	context: Ctx,
	stage: BaseStage<Ctx>
): TE.TaskEither<Error, Ctx> =>
	match(shouldStageRun(context, stage))
		.with(true, () => stage.execute(context))
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const setupAndExecuteStage = <Ctx extends Context>(
	contextTE: TE.TaskEither<Error, Ctx>,
	stage: BaseStage<Ctx>
) =>
	pipe(
		contextTE,
		TE.map((_) => {
			logger.info(`Starting stage: ${stage.name}`);
			return _;
		}),
		TE.chain((_) => executeStage(_, stage)),
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

const executeAllStages = <Ctx extends Context>(
	context: Ctx,
	stages: BaseStage<Ctx>[]
): TE.TaskEither<Error, Ctx> =>
	pipe(
		stages,
		A.reduce(TE.right<Error, Ctx>(context), (ctxTE, stage) =>
			setupAndExecuteStage(ctxTE, stage)
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
		executeAllStages(context, setupStages),
		TE.chain(incompleteToCompleteContext),
		TE.chain((_) => executeAllStages(_, conditionalStages))
	);
