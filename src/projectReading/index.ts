import { taskEither } from 'fp-ts';
import { either } from 'fp-ts';
import { ProjectType } from '../context/ProjectType';
import { function as func } from 'fp-ts';
import path from 'path';
import { readFile } from '../functions/File';
import { getCwd } from '../command/getCwd';
import {
	DOCKER_PROJECT_FILE,
	HELM_PROJECT_FILE,
	MAVEN_PROJECT_FILE,
	NPM_PROJECT_FILE,
	TERRAFORM_JSON_PATH
} from '../configFileTypes/constants';
import { PomXml } from '../configFileTypes/PomXml';
import { parseXml } from '../functions/Xml';
import { match } from 'ts-pattern';
import {
	isDocker,
	isGradle,
	isHelm,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { PackageJson } from '../configFileTypes/PackageJson';
import { parseJson } from '../functions/Json';
import { DockerJson } from '../configFileTypes/DockerJson';
import { readGradleProject } from '../special/gradle';
import { HelmJson } from '../configFileTypes/HelmJson';
import { TerraformJson } from '../configFileTypes/TerraformJson';

const readMavenProject = (
	cwd: string = getCwd()
): either.Either<Error, PomXml> =>
	func.pipe(
		readFile(path.join(cwd, MAVEN_PROJECT_FILE)),
		either.chain((_) => parseXml<PomXml>(_))
	);

const readNpmProject = (
	cwd: string = getCwd()
): either.Either<Error, PackageJson> =>
	func.pipe(
		readFile(path.join(cwd, NPM_PROJECT_FILE)),
		either.chain((_) => parseJson<PackageJson>(_))
	);

const readDockerProject = (
	cwd: string = getCwd()
): either.Either<Error, DockerJson> =>
	func.pipe(
		readFile(path.join(cwd, DOCKER_PROJECT_FILE)),
		either.chain((_) => parseJson<DockerJson>(_))
	);

export const readHelmProject = (
	cwd: string = getCwd()
): either.Either<Error, HelmJson> =>
	func.pipe(
		readFile(path.join(cwd, HELM_PROJECT_FILE)),
		either.chain((_) => parseJson<HelmJson>(_))
	);

export const readTerraformProject = (
	cwd: string = getCwd()
): either.Either<Error, TerraformJson> =>
	func.pipe(
		readFile(path.join(cwd, TERRAFORM_JSON_PATH)),
		either.chain((_) => parseJson<TerraformJson>(_))
	);

export const getRawProjectData = <T>(
	projectType: ProjectType,
	cwd: string = getCwd()
): taskEither.TaskEither<Error, T> => {
	const rawProjectTE: taskEither.TaskEither<Error, unknown> = match(
		projectType
	)
		.when(isMaven, () => taskEither.fromEither(readMavenProject(cwd)))
		.when(isNpm, () => taskEither.fromEither(readNpmProject(cwd)))
		.when(isDocker, () => taskEither.fromEither(readDockerProject(cwd)))
		.when(isGradle, () => readGradleProject(cwd))
		.when(isHelm, () => taskEither.fromEither(readHelmProject(cwd)))
		.run();
	return func.pipe(
		rawProjectTE,
		taskEither.map((data) => {
			return data as unknown as T;
		})
	);
};
