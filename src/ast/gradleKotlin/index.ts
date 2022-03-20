import * as File from '../../functions/File';
import * as Either from 'fp-ts/Either';
import path from 'path';
import { getCwd } from '../../command/getCwd';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import * as RArray from 'fp-ts/ReadonlyArray';
import * as Option from 'fp-ts/Option';
import * as Regex from '../../functions/RegExp';

const COMMENT_REGEX = /^\/\/.*$/;
const testCommentRegex = Regex.regexTest(COMMENT_REGEX);

enum LineType {
	COMMENT
}

type LineAndType = [line: string, type: LineType];

interface Context {
	readonly sectionName: string;
}

const getLineType = (line: string): Option.Option<LineAndType> =>
	match(line.trim())
		.with(when(testCommentRegex), () =>
			Option.some<LineAndType>([line, LineType.COMMENT])
		)
		.otherwise(() => Option.none);

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
