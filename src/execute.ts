import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { logger } from './logger';
import * as EU from './functions/EitherUtils';
import { stringifyJson } from './functions/Json';
import * as P from 'fp-ts/Predicate';
import { match, when } from 'ts-pattern';
import { stages } from './stages';

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

const verifyAndExecuteStage = (contextTE: TE.TaskEither<Error, BuildContext>): TE.TaskEither<Error, BuildContext> => {
	pipe(
		contextTE,
		TE.map((_) => {
			logger.info(`Starting stage: ${stage.name}`);
			return _;
		}),
	)
}

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
			setupAndExecuteStage(ctxTE, stage)
		)
	);
