import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { ProjectType } from '../context/ProjectType';
import { pipe } from 'fp-ts/function';
import path from 'path';
import { readFile } from '../functions/File';
import { getCwd } from '../command/getCwd';
import {
	DOCKER_PROJECT_FILE,
	MAVEN_PROJECT_FILE,
	NPM_PROJECT_FILE
} from '../configFileTypes/constants';
import { PomXml } from '../configFileTypes/PomXml';
import { parseXml } from '../functions/Xml';
import { match, when } from 'ts-pattern';
import {
	isDocker,
	isGradle,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { PackageJson } from '../configFileTypes/PackageJson';
import { parseJson } from '../functions/Json';
import { DockerJson } from '../configFileTypes/DockerJson';
import { readGradleProject } from '../special/gradle';

let project: O.Option<unknown> = O.none;

const readMavenProject = (): E.Either<Error, PomXml> =>
	pipe(
		readFile(path.join(getCwd(), MAVEN_PROJECT_FILE)),
		E.chain((_) => parseXml<PomXml>(_))
	);

const readNpmProject = (): E.Either<Error, PackageJson> =>
	pipe(
		readFile(path.join(getCwd(), NPM_PROJECT_FILE)),
		E.chain((_) => parseJson<PackageJson>(_))
	);

const readDockerProject = (): E.Either<Error, DockerJson> =>
	pipe(
		readFile(path.join(getCwd(), DOCKER_PROJECT_FILE)),
		E.chain((_) => parseJson<DockerJson>(_))
	);

const readAndCacheRawProjectData = <T>(
	projectType: ProjectType
): TE.TaskEither<Error, T> => {
	const rawProjectTE: TE.TaskEither<Error, unknown> = match(projectType)
		.with(when(isMaven), () => TE.fromEither(readMavenProject()))
		.with(when(isNpm), () => TE.fromEither(readNpmProject()))
		.with(when(isDocker), () => TE.fromEither(readDockerProject()))
		.with(when(isGradle), () => readGradleProject(getCwd()))
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
): TE.TaskEither<Error, T> => {
	if (process.env.NODE_ENV === 'test') {
		return readAndCacheRawProjectData<T>(projectType);
	}

	return pipe(
		project,
		O.fold(
			() => readAndCacheRawProjectData<T>(projectType),
			(_) => TE.right(_ as T)
		)
	);
};
