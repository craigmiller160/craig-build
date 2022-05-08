import * as File from '../../functions/File';
import * as Either from 'fp-ts/Either';
import path from 'path';
import { getCwd } from '../../command/getCwd';
import { pipe } from 'fp-ts/function';
import { match, when, __ } from 'ts-pattern';
import * as RArray from 'fp-ts/ReadonlyArray';
import * as Option from 'fp-ts/Option';
import produce, { castDraft } from 'immer';
import { logger } from '../../logger';
import { RegexTest, RegexGroups } from './regex';

enum LineType {
	COMMENT = 'COMMENT',
	PROPERTY = 'PROPERTY',
	VARIABLE = 'VARIABLE',
	SECTION_START = 'SECTION_START',
	SECTION_END = 'SECTION_END',
	FUNCTION = 'FUNCTION'
}

type LineAndType = [line: string, type: LineType];
type ContextAndLineType = [context: GradleContext, lineType: LineType];
type ContextAndLines = [context: GradleContext, lines: ReadonlyArray<string>];

interface GFunction {
	readonly name: string;
	readonly args: ReadonlyArray<string>;
}

export interface GradleContext {
	readonly name: string;
	readonly properties: Record<string, string>;
	readonly variables: Record<string, string>;
	readonly functions: ReadonlyArray<GFunction>;
	readonly children: ReadonlyArray<GradleContext>;
}

const createContext = (
	name: string,
	parentVariables: Record<string, string> = {}
): GradleContext => ({
	name,
	properties: {},
	variables: {
		...parentVariables
	},
	functions: [],
	children: []
});

const getLineType = (line: string): Option.Option<LineAndType> =>
	match(line.trim())
		.with(when(RegexTest.comment), () =>
			Option.some<LineAndType>([line, LineType.COMMENT])
		)
		.with(when(RegexTest.variable), () =>
			Option.some<LineAndType>([line, LineType.VARIABLE])
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
	context: GradleContext,
	line: string
): Either.Either<Error, GradleContext> =>
	pipe(
		RegexGroups.property(line),
		Either.map(({ key, value }) =>
			produce(context, (draft) => {
				draft.properties[key.trim()] = value.trim();
			})
		)
	);

const handleSectionStart = (
	context: GradleContext,
	line: string
): Either.Either<Error, GradleContext> =>
	pipe(
		RegexGroups.sectionStart(line),
		Either.map(({ sectionName }) => createContext(sectionName.trim())),
		Either.map((childContext) =>
			produce(context, (draft) => {
				draft.children.push(castDraft(childContext));
			})
		)
	);

const formatArgs = (args: string): ReadonlyArray<string> =>
	pipe(
		args.split(','),
		RArray.filter((arg) => arg.trim().length > 0),
		RArray.map((arg) => arg.trim().replace(/['"]/g, ''))
	);

const handleFunction = (
	context: GradleContext,
	line: string
): Either.Either<Error, GradleContext> =>
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

const handleVariable = (
	context: GradleContext,
	line: string
): Either.Either<Error, GradleContext> =>
	pipe(
		RegexGroups.variable(line),
		Either.map(({ name, value }) =>
			produce(context, (draft) => {
				draft.variables[name.trim()] = value.trim();
			})
		)
	);

const handleLineType = (
	context: GradleContext,
	lineAndType: LineAndType
): Either.Either<Error, ContextAndLineType> => {
	const newContextEither = match(lineAndType)
		.with([__.string, LineType.PROPERTY], ([line]) =>
			handleProperty(context, line)
		)
		.with([__.string, LineType.VARIABLE], ([line]) =>
			handleVariable(context, line)
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
	context: GradleContext,
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

const handleSectionEndParsingEnd = (
	context: GradleContext,
	remainingLines: ReadonlyArray<string>
): Either.Either<Error, ContextAndLines> =>
	Either.right([context, remainingLines]);

const handleRemainingLinesNotEmptyParsingEnd = (
	context: GradleContext,
	remainingLines: ReadonlyArray<string>
): Either.Either<Error, ContextAndLines> => parse(context, remainingLines);

const handleOtherwiseParsingEnd = (
	context: GradleContext
): Either.Either<Error, ContextAndLines> => Either.right([context, []]);

const handleParsingStepEnd =
	(remainingLines: ReadonlyArray<string>) =>
	(
		ctxAndLineType: ContextAndLineType
	): Either.Either<Error, ContextAndLines> => {
		const [context, lineType] = ctxAndLineType;
		return match({ lineType, remainingLines })
			.with({ lineType: LineType.SECTION_START }, () =>
				handleSectionStartParsingEnd(context, remainingLines)
			)
			.with({ lineType: LineType.SECTION_END }, () =>
				handleSectionEndParsingEnd(context, remainingLines)
			)
			.with({ remainingLines: when(isNotEmpty) }, () =>
				handleRemainingLinesNotEmptyParsingEnd(context, remainingLines)
			)
			.otherwise(() => handleOtherwiseParsingEnd(context));
	};

const parse = (
	context: GradleContext,
	lines: ReadonlyArray<string>
): Either.Either<Error, ContextAndLines> => {
	const lineAndType = pipe(
		RArray.head(lines),
		Option.chain(getLineType),
		Option.getOrElse((): LineAndType => ['', LineType.COMMENT])
	);

	const remainingLines = getTailLines(lines);

	return pipe(
		handleLineType(context, lineAndType),
		Either.chain(handleParsingStepEnd(remainingLines))
	);
};

const parseGradleFile = (
	context: GradleContext,
	fileName: string
): Either.Either<Error, GradleContext> => {
	const filePath = path.join(getCwd(), fileName);
	if (File.exists(filePath)) {
		return pipe(
			File.readFile(filePath),
			Either.map((content) => content.split('\n')),
			Either.chain((lines) => parse(context, lines)),
			Either.map(([context]) => context)
		);
	} else {
		logger.warn(`Gradle file path does not exist: ${filePath}`);
		return Either.right(context);
	}
};

export const parseGradleAst = (): Either.Either<Error, GradleContext> =>
	pipe(
		parseGradleFile(createContext('ROOT'), 'settings.gradle.kts'),
		Either.chain((context) => parseGradleFile(context, 'build.gradle.kts'))
	);
