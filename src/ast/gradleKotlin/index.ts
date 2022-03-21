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

const COMMENT_REGEX = /^\/\/.*$/;
const PROPERTY_REGEX = /^(?<key>.*?)\s*=\s*["']?(?<value>.*?)["']?$/;
const testCommentRegex = Regex.regexTest(COMMENT_REGEX);
const testPropertyRegex = Regex.regexTest(PROPERTY_REGEX);

enum LineType {
	COMMENT,
	PROPERTY
}

type LineAndType = [line: string, type: LineType];

interface PropertyGroups {
	readonly key: string;
	readonly value: string;
}

interface Property {
	readonly key: string;
	readonly value: string;
}

interface Context {
	readonly sectionName: string;
	readonly rootProperties: ReadonlyArray<Property>;
}

const newContext = (): Context => ({
	sectionName: '',
	rootProperties: []
});

const getLineType = (line: string): Option.Option<LineAndType> =>
	match(line.trim())
		.with(when(testCommentRegex), () =>
			Option.some<LineAndType>([line, LineType.COMMENT])
		)
		.with(when(testPropertyRegex), () =>
			Option.some<LineAndType>([line, LineType.PROPERTY])
		)
		.otherwise(() => Option.none);

const handleProperty = (context: Context, line: string): Context =>
	pipe(
		Regex.regexExecGroups<PropertyGroups>(PROPERTY_REGEX)(line),
		Option.map(
			({ key, value }): Property => ({
				key: key.trim(),
				value: value.trim()
			})
		),
		Option.map((property) =>
			produce(context, (draft) => {
				draft.rootProperties.push(property);
			})
		),
		Option.getOrElse(() => {
			// TODO log the fact this shouldn't happen
			console.error('SHOULD NOT HAPPEN');
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
		console.error(`File path does not exist: ${filePath}`);
		return Either.right(context);
	}
};

export const parseGradleAst = (): Either.Either<Error, Context> =>
	pipe(
		parseGradleFile(newContext(), 'settings.gradle.kts'),
		Either.chain((context) => parseGradleFile(context, 'build.gradle.kts'))
	);
