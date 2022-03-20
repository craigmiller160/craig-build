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
const PROPERTY_REGEX = /^(.*)\s*=\s*["']?(.*)["']?$/;
const testCommentRegex = Regex.regexTest(COMMENT_REGEX);
const testPropertyRegex = Regex.regexTest(PROPERTY_REGEX);

enum LineType {
	COMMENT,
	PROPERTY
}

type LineAndType = [line: string, type: LineType];

interface Property {
	readonly key: string;
	readonly value: string;
}

interface Context {
	readonly sectionName: string;
	readonly rootProperties: ReadonlyArray<Property>;
}

const getLineType = (line: string): Option.Option<LineAndType> =>
	match(line.trim())
		.with(when(testCommentRegex), () =>
			Option.some<LineAndType>([line, LineType.COMMENT])
		)
		.with(when(testPropertyRegex), () =>
			Option.some<LineAndType>([line, LineType.PROPERTY])
		)
		.otherwise(() => Option.none);

const handleProperty = (context: Context, line: string) => {
	const [key, value] = line.split('=');
	const property: Property = {
		key: key.trim(),
		value: value.trim()
	};
	const newContext = produce(context, (draft) => {
		draft.rootProperties.push(property);
	});
};

const handleLineType = (context: Context, lineAndType: LineAndType) =>
	match(lineAndType)
		.with([__.string, LineType.PROPERTY], ([line]) => handleProperty(context, line))
		.run(); // TODO figure out otherwise

const parse = (context: Context, lines: ReadonlyArray<string>) => {
	pipe(RArray.head(lines), Option.chain(getLineType));
};

const parseSettingsGradle = () => {
	pipe(
		File.readFile(path.join(getCwd(), 'settings.gradle.kts')),
		Either.map((content) => content.split('\n')),
		Either.map((lines) => parse({ sectionName: '' }, lines))
	);
};

export const parseGradleConfig = () => {
	parseSettingsGradle();
};
