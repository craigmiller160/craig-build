import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';

type StageExecuteFn = (
	context: BuildContext
) => TE.TaskEither<Error, BuildContext>;

export interface Stage {
	readonly name: string;
	readonly execute: StageExecuteFn;
	readonly commandAllowsStage: P.Predicate<BuildContext>;
	readonly projectAllowsStage: P.Predicate<BuildContext>;
}
