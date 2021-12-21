import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';

export type Stage2 = (
	context: BuildContext
) => TE.TaskEither<Error, BuildContext>;

export type Stage = {
	name: string;
	(context: BuildContext): TE.TaskEither<Error,BuildContext>;
};
