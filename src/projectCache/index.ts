import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { ProjectType } from '../context/ProjectType';
import { pipe } from 'fp-ts/function';

const project: O.Option<unknown> = O.none;

const readAndCacheRawProjectData = <T>(
	projectType: ProjectType
): TE.TaskEither<Error, T> => {
	throw new Error();
};

export const getRawProjectData = <T>(
	projectType: ProjectType
): TE.TaskEither<Error, T> =>
	pipe(
		project,
		O.fold(
			() => readAndCacheRawProjectData<T>(projectType),
			(_) => TE.right(_ as T)
		)
	);
