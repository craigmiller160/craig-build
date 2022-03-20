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

// TODO what to do if None is returned here? Probably need some kind of hard error?
const handleProperty = (
	context: Context,
	line: string
): Option.Option<Context> => {
	return pipe(
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
		)
	);
};

const handleLineType = (
	context: Context,
	lineAndType: LineAndType
): Option.Option<Context> =>
	match(lineAndType)
		.with([__.string, LineType.PROPERTY], ([line]) =>
			handleProperty(context, line)
		)
		.run(); // TODO figure out otherwise

const parse = (context: Context, lines: ReadonlyArray<string>): Context => {
	const { newContext, newLines } = pipe(
		RArray.head(lines),
		Option.chain(getLineType),
		Option.chain((_) => handleLineType(context, _)),
		Option.bindTo('newContext'),
		Option.bind('newLines', () => RArray.tail(lines)),
		Option.getOrElse(() => ({
			newContext: context,
			newLines: [] as ReadonlyArray<string>
		}))
	);
	if (newLines.length > 0) {
		return parse(newContext, newLines);
	}
	return newContext;
};

const parseGradleFile = (
	context: Context,
	fileName: string
): Either.Either<Error, Context> =>
	pipe(
		File.readFile(path.join(getCwd(), fileName)),
		Either.map((content) => content.split('\n')),
		Either.map((lines) => parse(context, lines))
	);

export const parseGradleAst = (): Either.Either<Error, Context> =>
	pipe(
		parseGradleFile(newContext(), 'settings.gradle.kts'),
		Either.chain((context) => parseGradleFile(context, 'build.gradle.kts'))
	);
