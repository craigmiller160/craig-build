import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { ProjectType } from '../context/ProjectType';
import { pipe } from 'fp-ts/function';
import path from 'path';
import { readFile } from '../functions/File';
import { getCwd } from '../command/getCwd';
import { MAVEN_PROJECT_FILE } from '../configFileTypes/constants';
import { PomXml } from '../configFileTypes/PomXml';
import { parseXml } from '../functions/Xml';
import { match, when } from 'ts-pattern';
import { isMaven } from '../context/projectTypeUtils';

let project: O.Option<unknown> = O.none;

const readMavenProject = (): TE.TaskEither<Error, PomXml> =>
	pipe(
		readFile(path.join(getCwd(), MAVEN_PROJECT_FILE)),
		E.chain((_) => parseXml<PomXml>(_)),
		TE.fromEither
	);

const readAndCacheRawProjectData = <T>(
	projectType: ProjectType
): TE.TaskEither<Error, T> => {
	const rawProjectTE = match(projectType)
		.with(when(isMaven), readMavenProject)
		.run();
	return pipe(
		rawProjectTE,
		TE.map((data) => {
			project = O.some(data);
			return data as unknown as T;
		})
	);
};

export const getRawProjectData = <T>(
	projectType: ProjectType
): TE.TaskEither<Error, T> =>
	pipe(
		project,
		O.fold(
			() => readAndCacheRawProjectData<T>(projectType),
			(_) => TE.right(_ as T)
		)
	);
