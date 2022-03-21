import * as Regex from '../../functions/RegExp';
import * as Option from 'fp-ts/Option';
import * as Either from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

const COMMENT_REGEX = /^\/\/.*$/;
const PROPERTY_REGEX = /^(?<key>.*?)\s*=\s*["']?(?<value>.*?)["']?$/;
const SECTION_START_REGEX = /^(?<sectionName>.*?)\s?{$/;
const SECTION_END_REGEX = /^}$/;
const FUNCTION_REGEX = /^(?<name>.*?)\((?<args>.*?)\).*$/;

export const RegexTest = {
	comment: Regex.regexTest(COMMENT_REGEX),
	property: Regex.regexTest(PROPERTY_REGEX),
	sectionStart: Regex.regexTest(SECTION_START_REGEX),
	sectionEnd: Regex.regexTest(SECTION_END_REGEX),
	function: Regex.regexTest(FUNCTION_REGEX)
};

const toRegexEither =
	(type: string) =>
	<T extends object>(
		regexOption: Option.Option<T>
	): Either.Either<Error, T> =>
		pipe(
			regexOption,
			Either.fromOption(
				() =>
					new Error(
						`Error extracting regex groups. Regex Type: ${type}`
					)
			)
		);

const extractGroups =
	(regex: RegExp, type: string) =>
	<T extends object>(text: string): Either.Either<Error, T> =>
		pipe(Regex.regexExecGroups<T>(regex)(text), toRegexEither(type));

export const RegexGroups = {
	property: extractGroups(PROPERTY_REGEX, 'Property'),
	sectionStart: extractGroups(SECTION_START_REGEX, 'Section Start'),
	function: extractGroups(FUNCTION_REGEX, 'Function')
};
