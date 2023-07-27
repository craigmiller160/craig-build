import fs from 'fs';
import { either } from 'fp-ts';
import { option } from 'fp-ts';
import { unknownToError } from './unknownToError';
import { function as func } from 'fp-ts';

export const readFile = (filePath: string): either.Either<Error, string> =>
	either.tryCatch(() => fs.readFileSync(filePath, 'utf8'), unknownToError);

export const exists = (filePath: string): boolean =>
	func.pipe(
		either.tryCatch(() => fs.existsSync(filePath), unknownToError),
		either.fold(() => false, func.identity)
	);

export const rmDirIfExists = (dirPath: string): either.Either<Error, void> =>
	either.tryCatch(() => {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}, unknownToError);

export const mkdir = (dirPath: string): either.Either<Error, string> =>
	func.pipe(
		either.tryCatch(
			() => fs.mkdirSync(dirPath, { recursive: true }),
			unknownToError
		),
		either.map(option.fromNullable),
		either.chain(
			option.fold(
				() => either.left(new Error('mkdir returned undefined')),
				either.right
			)
		)
	);

export const listFilesInDir = (
	dirPath: string
): either.Either<Error, string[]> =>
	either.tryCatch(() => fs.readdirSync(dirPath), unknownToError);
