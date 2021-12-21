import * as E from 'fp-ts/Either';
import { unknownToError } from './unknownToError';

export const parseJson = <T>(json: string): E.Either<Error, T> =>
	E.tryCatch(() => JSON.parse(json), unknownToError);
