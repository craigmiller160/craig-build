import { either } from 'fp-ts';
import { unknownToError } from './unknownToError';

export const parseJson = <T>(json: string): E.Either<Error, T> =>
	E.tryCatch(() => JSON.parse(json), unknownToError);

export const stringifyJson = (
	value: unknown,
	indent = 0
): E.Either<Error, string> =>
	E.tryCatch(() => JSON.stringify(value, null, indent), unknownToError);
