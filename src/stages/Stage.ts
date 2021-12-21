import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';

export type StageFunction = (context: BuildContext) => TE.TaskEither<Error, BuildContext>;

export interface Stage {
	name: string;
	execute: StageFunction;
}