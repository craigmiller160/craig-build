import * as File from '../../functions/File';
import * as Either from 'fp-ts/Either';
import path from 'path';
import { getCwd } from '../../command/getCwd';
import { pipe } from 'fp-ts/function';
import { match, when, __ } from 'ts-pattern';
import * as RArray from 'fp-ts/ReadonlyArray';
import * as Option from 'fp-ts/Option';
import * as Regex from '../../functions/RegExp';
import produce from 'immer';
import { logger } from '../../logger';

const COMMENT_REGEX = /^\/\/.*$/;
const PROPERTY_REGEX = /^(?<key>.*?)\s*=\s*["']?(?<value>.*?)["']?$/;
const SECTION_START_REGEX = /^(?<sectionName>.*?)\s?{$/;
const SECTION_END_REGEX = /^}.*$/;
const testCommentRegex = Regex.regexTest(COMMENT_REGEX);
const testPropertyRegex = Regex.regexTest(PROPERTY_REGEX);
const testSectionStartRegex = Regex.regexTest(SECTION_START_REGEX);
const testSectionEndRegex = Regex.regexTest(SECTION_END_REGEX);

enum LineType {
	COMMENT,
	PROPERTY,
	SECTION_START,
	SECTION_END
}

type LineAndType = [line: string, type: LineType];
type ContextAndLines = [context: Context, lines: ReadonlyArray<string>];

interface PropertyGroups {
	readonly key: string;
	readonly value: string;
}

interface Context {
	readonly name: string;
	readonly properties: Record<string, string>;
	readonly children: ReadonlyArray<Context>;
}

const newContext = (): Context => ({
	name: 'ROOT',
	properties: {},
	children: []
});

const getLineType = (line: string): Option.Option<LineAndType> =>
	match(line.trim())
		.with(when(testCommentRegex), () =>
			Option.some<LineAndType>([line, LineType.COMMENT])
		)
		.with(when(testPropertyRegex), () =>
			Option.some<LineAndType>([line, LineType.PROPERTY])
		)
		.with(when(testSectionStartRegex), () =>
			Option.some<LineAndType>([line, LineType.SECTION_START])
		)
		.with(when(testSectionEndRegex), () =>
			Option.some<LineAndType>([line, LineType.SECTION_END])
		)
		.otherwise(() => Option.none);

const handleProperty = (context: Context, line: string): Context =>
	pipe(
		Regex.regexExecGroups<PropertyGroups>(PROPERTY_REGEX)(line),
		Option.map(({ key, value }) =>
			produce(context, (draft) => {
				draft.properties[key.trim()] = value.trim();
			})
		),
		Option.getOrElse(() => {
			logger.error('REGEX GROUPS SHOULD NOT BE NULL');
			return context;
		})
	);

const handleLineType = (context: Context, lineAndType: LineAndType): Context =>
	match(lineAndType)
		.with([__.string, LineType.PROPERTY], ([line]) =>
			handleProperty(context, line)
		)
		.otherwise(() => context);

const getTailLines = (lines: ReadonlyArray<string>): ReadonlyArray<string> =>
	pipe(
		RArray.tail(lines),
		Option.getOrElse((): ReadonlyArray<string> => [])
	);

const parse = (context: Context, lines: ReadonlyArray<string>): Context => {
	const newContext = pipe(
		RArray.head(lines),
		Option.chain(getLineType),
		Option.map((_) => handleLineType(context, _)),
		Option.getOrElse(() => context)
	);
	const remainingLines = getTailLines(lines);
	if (remainingLines.length > 0) {
		return parse(newContext, remainingLines);
	}
	return newContext;
};

const parseGradleFile = (
	context: Context,
	fileName: string
): Either.Either<Error, Context> => {
	const filePath = path.join(getCwd(), fileName);
	if (File.exists(filePath)) {
		return pipe(
			File.readFile(filePath),
			Either.map((content) => content.split('\n')),
			Either.map((lines) => parse(context, lines))
		);
	} else {
		logger.warn(`Gradle file path does not exist: ${filePath}`);
		return Either.right(context);
	}
};

export const parseGradleAst = (): Either.Either<Error, Context> =>
	pipe(
		parseGradleFile(newContext(), 'settings.gradle.kts'),
		Either.chain((context) => parseGradleFile(context, 'build.gradle.kts'))
	);
