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

const readMavenProject = (): either.Either<Error, PomXml> =>
	func.pipe(
		readFile(path.join(getCwd(), MAVEN_PROJECT_FILE)),
		either.chain((_) => parseXml<PomXml>(_))
	);

const readNpmProject = (): either.Either<Error, PackageJson> =>
	func.pipe(
		readFile(path.join(getCwd(), NPM_PROJECT_FILE)),
		either.chain((_) => parseJson<PackageJson>(_))
	);

const readDockerProject = (): either.Either<Error, DockerJson> =>
	func.pipe(
		readFile(path.join(getCwd(), DOCKER_PROJECT_FILE)),
		either.chain((_) => parseJson<DockerJson>(_))
	);

export const readHelmProject = (): either.Either<Error, HelmJson> =>
	func.pipe(
		readFile(path.join(getCwd(), HELM_PROJECT_FILE)),
		either.chain((_) => parseJson<HelmJson>(_))
	);

export const readTerraformProject = (): either.Either<Error, TerraformJson> =>
	func.pipe(
		readFile(path.join(getCwd(), TERRAFORM_JSON_PATH)),
		either.chain((_) => parseJson<TerraformJson>(_))
	);

export const getRawProjectData = <T>(
	projectType: ProjectType
): taskEither.TaskEither<Error, T> => {
	const rawProjectTE: taskEither.TaskEither<Error, unknown> = match(
		projectType
	)
		.when(isMaven, () => taskEither.fromEither(readMavenProject()))
		.when(isNpm, () => taskEither.fromEither(readNpmProject()))
		.when(isDocker, () => taskEither.fromEither(readDockerProject()))
		.when(isGradle, () => readGradleProject(getCwd()))
		.when(isHelm, () => taskEither.fromEither(readHelmProject()))
		.run();
	return func.pipe(
		rawProjectTE,
		taskEither.map((data) => {
			return data as unknown as T;
		})
	);
};
