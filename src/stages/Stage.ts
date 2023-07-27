import { BuildContext } from '../context/BuildContext';
import { taskEither, predicate } from 'fp-ts';

export type StageExecuteFn = (
	context: BuildContext
) => taskEither.TaskEither<Error, BuildContext>;

export interface Stage {
	readonly name: string;
	readonly execute: StageExecuteFn;
	readonly shouldStageExecute: predicate.Predicate<BuildContext>;
}
