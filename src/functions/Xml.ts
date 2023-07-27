import { either } from 'fp-ts';
import { unknownToError } from './unknownToError';
import { Parser } from 'xml2js';
import { option } from 'fp-ts';
import { function as func } from 'fp-ts';

export const parseXml = <T>(xml: string): E.Either<Error, T> =>
	pipe(
		E.tryCatch(() => {
			let parsed: O.Option<T> = O.none;
			const parser = new Parser();
			parser.parseString(xml, (error: Error | null, result: T) => {
				if (error) {
					throw error;
				}
				parsed = O.some(result);
			});
			return pipe(
				parsed,
				E.fromOption(() => new Error('No parsed XML to return'))
			);
		}, unknownToError),
		E.flatten
	);
