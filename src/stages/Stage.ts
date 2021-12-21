import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';

export type Stage = (
	context: BuildContext
) => TE.TaskEither<Error, BuildContext>;
