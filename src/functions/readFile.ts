import fs from 'fs';
import * as E from 'fp-ts/Either';
import { unknownToError } from './unknownToError';

export const readFile = (filePath: string): E.Either<Error, string> =>
	E.tryCatch(() => fs.readFileSync(filePath, 'utf8'), unknownToError);
