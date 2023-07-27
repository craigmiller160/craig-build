import fs from 'fs';
import { either } from 'fp-ts';
import { option } from 'fp-ts';
import { unknownToError } from './unknownToError';
import { function as func } from 'fp-ts';
import { identity } from 'fp-ts/function';

export const readFile = (filePath: string): E.Either<Error, string> =>
	E.tryCatch(() => fs.readFileSync(filePath, 'utf8'), unknownToError);

export const exists = (filePath: string): boolean =>
	pipe(
		E.tryCatch(() => fs.existsSync(filePath), unknownToError),
		E.fold(() => false, identity)
	);

export const rmDirIfExists = (dirPath: string): E.Either<Error, void> =>
	E.tryCatch(() => {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}, unknownToError);

export const mkdir = (dirPath: string): E.Either<Error, string> =>
	pipe(
		E.tryCatch(
			() => fs.mkdirSync(dirPath, { recursive: true }),
			unknownToError
		),
		E.map(O.fromNullable),
		E.chain(
			O.fold(() => E.left(new Error('mkdir returned undefined')), E.right)
		)
	);

export const listFilesInDir = (dirPath: string): E.Either<Error, string[]> =>
	E.tryCatch(() => fs.readdirSync(dirPath), unknownToError);
