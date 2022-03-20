import * as File from '../../functions/File';
import * as Either from 'fp-ts/Either';
import path from 'path';
import { getCwd } from '../../command/getCwd';
import { pipe } from 'fp-ts/function';

interface Context {
	readonly sectionName: string;
}

const parse = (context: Context, lines: ReadonlyArray<string>) => {};

const parseSettingsGradle = () => {
	pipe(
		File.readFile(path.join(getCwd(), 'settings.gradle.kts')),
		Either.map((content) => content.split('\n')),
		Either.map((lines) => parse({ sectionName: '' }, lines))
	);
};

export const parseGradleConfig = () => {};
