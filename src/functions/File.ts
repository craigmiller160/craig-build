import fs from 'fs';
import * as E from 'fp-ts/Either';
import { unknownToError } from './unknownToError';

export const readFile = (filePath: string): E.Either<Error, string> =>
	E.tryCatch(() => fs.readFileSync(filePath, 'utf8'), unknownToError);

export const rmDirIfExists = (dirPath: string): E.Either<Error, void> =>
	E.tryCatch(() => {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}, unknownToError);

export const mkdir = (dirPath: string): E.Either<Error, string> =>
	E.tryCatch(
		() => fs.mkdirSync(dirPath, { recursive: true }),
		unknownToError
	);
