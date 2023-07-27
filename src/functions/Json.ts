import { either } from 'fp-ts';
import { unknownToError } from './unknownToError';

export const parseJson = <T>(json: string): either.Either<Error, T> =>
	either.tryCatch(() => JSON.parse(json), unknownToError);

export const stringifyJson = (
	value: unknown,
	indent = 0
): either.Either<Error, string> =>
	either.tryCatch(() => JSON.stringify(value, null, indent), unknownToError);
