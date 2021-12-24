import { EarlyStage, EarlyStageFunction } from './Stage';
import { pipe } from 'fp-ts/function';
import { extractProjectType } from '../context/contextExtraction';
import * as E from 'fp-ts/Either';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { match, when } from 'ts-pattern';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { isDocker, isMaven, isNpm } from '../context/projectTypeUtils';
import { readFile } from '../functions/readFile';
import path from 'path';
import { getCwd } from '../command/getCwd';
import { npmSeparateGroupAndName } from '../utils/npmSeparateGroupAndName';
import { parseJson } from '../functions/Json';
import { PackageJson } from '../configFileTypes/PackageJson';
import { DockerJson } from '../configFileTypes/DockerJson';
import { parseXml } from '../functions/Xml';
import { PomXml } from '../configFileTypes/PomXml';
import {
	DOCKER_PROJECT_FILE,
	MAVEN_PROJECT_FILE,
	NPM_PROJECT_FILE
} from '../configFileTypes/constants';

const readMavenProjectInfo = (): E.Either<Error, ProjectInfo> =>
	pipe(
		readFile(path.resolve(getCwd(), MAVEN_PROJECT_FILE)),
		E.chain((_) => parseXml<PomXml>(_)),
		E.map((pomXml): ProjectInfo => {
			const version = pomXml.project.version[0];
			return {
				group: pomXml.project.groupId[0],
				name: pomXml.project.artifactId[0],
				version,
				isPreRelease: version.includes('SNAPSHOT')
			};
		})
	);

const readNpmProjectInfo = (): E.Either<Error, ProjectInfo> =>
	pipe(
		readFile(path.resolve(getCwd(), NPM_PROJECT_FILE)),
		E.chain((_) => parseJson<PackageJson>(_)),
		E.map((packageJson): ProjectInfo => {
			const [group, name] = npmSeparateGroupAndName(packageJson.name);
			return {
				group,
				name,
				version: packageJson.version,
				isPreRelease: packageJson.version.includes('beta')
			};
		})
	);

const readDockerProjectInfo = (): E.Either<Error, ProjectInfo> =>
	pipe(
		readFile(path.resolve(getCwd(), DOCKER_PROJECT_FILE)),
		E.chain((_) => parseJson<DockerJson>(_)),
		E.map((dockerJson): ProjectInfo => {
			const [group, name] = npmSeparateGroupAndName(dockerJson.name);
			return {
				group,
				name,
				version: dockerJson.version,
				isPreRelease: dockerJson.version.includes('beta')
			};
		})
	);

const readProjectInfoByType = (
	projectType: ProjectType
): E.Either<Error, ProjectInfo> =>
	match(projectType)
		.with(when(isMaven), readMavenProjectInfo)
		.with(when(isNpm), readNpmProjectInfo)
		.with(when(isDocker), readDockerProjectInfo)
		.otherwise(() =>
			E.left(new Error(`Unsupported ProjectType: ${projectType}`))
		);

const execute: EarlyStageFunction = (context) =>
	pipe(
		extractProjectType(context),
		E.chain(readProjectInfoByType),
		E.map((_) => ({
			...context,
			projectInfo: O.some(_)
		})),
		TE.fromEither
	);

export const getProjectInfo: EarlyStage = {
	name: 'Get Project Info',
	execute
};
