import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { IncompleteBuildContext } from '../context/IncompleteBuildContext';
import { Context } from '../context/Context';
import * as P from 'fp-ts/Predicate';

export type StageExecuteFn<Ctx extends Context> = (
	context: Ctx
) => TE.TaskEither<Error, Ctx>;

export interface BaseStage<Ctx extends Context> {
	readonly name: string;
	execute: StageExecuteFn<Ctx>;
}

export type EarlyStage = BaseStage<IncompleteBuildContext>;

export interface ConditionalStage extends BaseStage<BuildContext> {
	commandAllowsStage: P.Predicate<BuildContext>;
	projectAllowsStage: P.Predicate<BuildContext>;
}
