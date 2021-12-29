import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';

export type StageExecuteFn = (
	context: BuildContext
) => TE.TaskEither<Error, BuildContext>;

export interface Stage {
	readonly name: string;
	readonly execute: StageExecuteFn;
	readonly shouldStageExecute: P.Predicate<BuildContext>;
}
