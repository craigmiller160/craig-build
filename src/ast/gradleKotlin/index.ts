import * as File from '../../functions/File';
import * as Either from 'fp-ts/Either';
import path from 'path';
import { getCwd } from '../../command/getCwd';
import { pipe } from 'fp-ts/function';
import { match, when, __ } from 'ts-pattern';
import * as RArray from 'fp-ts/ReadonlyArray';
import * as Option from 'fp-ts/Option';
import * as Regex from '../../functions/RegExp';
import produce, { castDraft } from 'immer';
import { logger } from '../../logger';
import { RegexTest, RegexGroups } from './regex';

const PROPERTY_REGEX = /^(?<key>.*?)\s*=\s*["']?(?<value>.*?)["']?$/;
const SECTION_START_REGEX = /^(?<sectionName>.*?)\s?{$/;
const FUNCTION_REGEX = /^(?<name>.*?)\((?<args>.*?)\).*$/;

enum LineType {
	COMMENT = 'COMMENT',
	PROPERTY = 'PROPERTY',
	SECTION_START = 'SECTION_START',
	SECTION_END = 'SECTION_END',
	FUNCTION = 'FUNCTION'
}

type LineAndType = [line: string, type: LineType];
type ContextAndLineType = [context: Context, lineType: LineType];
type ContextAndLines = [context: Context, lines: ReadonlyArray<string>];

// TODO replace error logs with real errors

interface SectionStartGroups {
	readonly sectionName: string;
}

interface PropertyGroups {
	readonly key: string;
	readonly value: string;
}

interface FunctionGroups {
	readonly name: string;
	readonly args: string;
}

interface GFunction {
	readonly name: string;
	readonly args: ReadonlyArray<string>;
}

interface Context {
	readonly name: string;
	readonly properties: Record<string, string>;
	readonly functions: ReadonlyArray<GFunction>;
	readonly children: ReadonlyArray<Context>;
}

const createContext = (name: string): Context => ({
	name,
	properties: {},
	functions: [],
	children: []
});

const getLineType = (line: string): Option.Option<LineAndType> =>
	match(line.trim())
		.with(when(RegexTest.comment), () =>
			Option.some<LineAndType>([line, LineType.COMMENT])
		)
		.with(when(RegexTest.property), () =>
			Option.some<LineAndType>([line, LineType.PROPERTY])
		)
		.with(when(RegexTest.sectionStart), () =>
			Option.some<LineAndType>([line, LineType.SECTION_START])
		)
		.with(when(RegexTest.sectionEnd), () =>
			Option.some<LineAndType>([line, LineType.SECTION_END])
		)
		.with(when(RegexTest.function), () =>
			Option.some<LineAndType>([line, LineType.FUNCTION])
		)
		.otherwise(() => Option.none);

const handleProperty = (
	context: Context,
	line: string
): Either.Either<Error, Context> =>
	pipe(
		RegexGroups.property(line),
		Either.map(({ key, value }) =>
			produce(context, (draft) => {
				draft.properties[key.trim()] = value.trim();
			})
		)
	);

const handleSectionStart = (
	context: Context,
	line: string
): Either.Either<Error, Context> => {
	pipe(
		RegexGroups.sectionStart(line),
		Either.map(({ sectionName }) => createContext(sectionName.trim())),
		Either.map((childContext) =>
			produce(context, (draft) => {
				draft.children.push(castDraft(childContext));
			})
		)
	);
};

const formatArgs = (args: string): ReadonlyArray<string> =>
	pipe(
		args.split(','),
		RArray.filter((arg) => arg.trim().length > 0),
		RArray.map((arg) => arg.trim().replace(/['"]/g, ''))
	);

const handleFunction = (
	context: Context,
	line: string
): Either.Either<Error, Context> =>
	pipe(
		RegexGroups.function(line),
		Either.map(
			({ name, args }): GFunction => ({
				name: name.trim(),
				args: formatArgs(args)
			})
		),
		Either.map((func) =>
			produce(context, (draft) => {
				draft.functions.push(castDraft(func));
			})
		)
	);

const handleLineType = (
	context: Context,
	lineAndType: LineAndType
): Either.Either<Error, ContextAndLineType> => {
	const newContextEither = match(lineAndType)
		.with([__.string, LineType.PROPERTY], ([line]) =>
			handleProperty(context, line)
		)
		.with([__.string, LineType.SECTION_START], ([line]) =>
			handleSectionStart(context, line)
		)
		.with([__.string, LineType.FUNCTION], ([line]) =>
			handleFunction(context, line)
		)
		.otherwise(() => Either.right(context));
	return pipe(
		newContextEither,
		Either.map(
			(newContext): ContextAndLineType => [newContext, lineAndType[1]]
		)
	);
};

const getTailLines = (lines: ReadonlyArray<string>): ReadonlyArray<string> =>
	pipe(
		RArray.tail(lines),
		Option.getOrElse((): ReadonlyArray<string> => [])
	);

const isNotEmpty = (lines: ReadonlyArray<string>): boolean => lines.length > 0;

const handleSectionStartParsingEnd = (
	context: Context,
	remainingLines: ReadonlyArray<string>
): Either.Either<Error, ContextAndLines> =>
	pipe(
		RArray.last(context.children),
		Either.fromOption(() => new Error('Context should have last child')),
		Either.chain((childContext) => parse(childContext, remainingLines)),
		Either.chain(([completeChildContext, newRemainingLines]) => {
			const combinedContext = produce(context, (draft) => {
				draft.children[draft.children.length - 1] =
					castDraft(completeChildContext);
			});
			return parse(combinedContext, newRemainingLines);
		})
	);

const handleParsingStepEnd =
	(remainingLines: ReadonlyArray<string>) =>
	(ctxAndLineType: ContextAndLineType) => {
		const [context, lineType] = ctxAndLineType;
		match({ lineType, remainingLines })
			.with({ lineType: LineType.SECTION_START }, () =>
				handleSectionStartParsingEnd(context, remainingLines)
			)
			.with({ lineType: LineType.SECTION_END }, (): ContextAndLines => {
				return [newContext, remainingLines];
			})
			.with({ remainingLines: when(isNotEmpty) }, (): ContextAndLines => {
				return parse(newContext, remainingLines);
			})
			.otherwise((): ContextAndLines => {
				return [newContext, []];
			});
	};

const parse = (
	context: Context,
	lines: ReadonlyArray<string>
): Either.Either<Error, ContextAndLines> => {
	const lineAndType = pipe(
		RArray.head(lines),
		Option.chain(getLineType),
		Option.getOrElse((): LineAndType => ['', LineType.COMMENT])
	);

	const remainingLines = getTailLines(lines);

	pipe(
		handleLineType(context, lineAndType),
		Either.map(([newCtx, lineType]) => {})
	);

	return match({ lineType, remainingLines })
		.with({ lineType: LineType.SECTION_START }, (): ContextAndLines => {
			const [completeChildContext, newRemainingLines] = pipe(
				RArray.last(newContext.children),
				Option.map((childContext) =>
					parse(childContext, remainingLines)
				),
				Option.getOrElse(() => {
					// TODO figure out solution here
					logger.error('Should not have null last child');
					return [newContext, remainingLines];
				})
			);
			const combinedContext = produce(newContext, (draft) => {
				draft.children[newContext.children.length - 1] =
					castDraft(completeChildContext);
			});
			return parse(combinedContext, newRemainingLines);
		})
		.with({ lineType: LineType.SECTION_END }, (): ContextAndLines => {
			return [newContext, remainingLines];
		})
		.with({ remainingLines: when(isNotEmpty) }, (): ContextAndLines => {
			return parse(newContext, remainingLines);
		})
		.otherwise((): ContextAndLines => {
			return [newContext, []];
		});
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
			Either.map((lines) => parse(context, lines)),
			Either.map(([context]) => context)
		);
	} else {
		logger.warn(`Gradle file path does not exist: ${filePath}`);
		return Either.right(context);
	}
};

export const parseGradleAst = (): Either.Either<Error, Context> =>
	pipe(
		parseGradleFile(createContext('ROOT'), 'settings.gradle.kts'),
		Either.chain((context) => parseGradleFile(context, 'build.gradle.kts'))
	);
