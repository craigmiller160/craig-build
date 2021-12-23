import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { IncompleteBuildContext } from '../context/IncompleteBuildContext';

export type EarlyStageFunction = (
	context: IncompleteBuildContext
) => TE.TaskEither<Error, IncompleteBuildContext>;

export interface EarlyStage {
	readonly name: string;
	readonly execute: EarlyStageFunction;
}

export type StageFunction = (
	context: BuildContext
) => TE.TaskEither<Error, BuildContext>;

export interface Stage {
	readonly name: string;
	readonly execute: StageFunction;
}
