import { either } from 'fp-ts';
import { unknownToError } from './unknownToError';
import { Parser } from 'xml2js';
import { option } from 'fp-ts';
import { function as func } from 'fp-ts';

export const parseXml = <T>(xml: string): either.Either<Error, T> =>
	func.pipe(
		either.tryCatch(() => {
			let parsed: option.Option<T> = option.none;
			const parser = new Parser();
			parser.parseString(xml, (error: Error | null, result: T) => {
				if (error) {
					throw error;
				}
				parsed = option.some(result);
			});
			return func.pipe(
				parsed,
				either.fromOption(() => new Error('No parsed XML to return'))
			);
		}, unknownToError),
		either.flatten
	);
