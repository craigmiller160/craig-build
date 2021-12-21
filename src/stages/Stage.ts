import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';

export type Stage = {
	name: string;
	(context: BuildContext): TE.TaskEither<Error,BuildContext>;
};
