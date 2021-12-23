import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { IncompleteBuildContext } from '../context/IncompleteBuildContext';
import { Context } from '../context/Context';

export type BaseStageFunction<Ctx extends Context> = (
	context: Ctx
) => TE.TaskEither<Error, Ctx>;
export type EarlyStageFunction = BaseStageFunction<IncompleteBuildContext>;
export type StageFunction = BaseStageFunction<BuildContext>;

export interface BaseStage<
	Ctx extends Context,
	StageFn extends BaseStageFunction<Ctx>
> {
	readonly name: string;
	readonly execute: StageFn;
}
export type EarlyStage = BaseStage<IncompleteBuildContext, EarlyStageFunction>;
export type Stage = BaseStage<BuildContext, StageFunction>;
