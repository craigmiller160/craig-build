import { Stage, StageExecuteFn } from './Stage';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { match, when } from 'ts-pattern';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';
import { isDocker, isMaven, isNpm } from '../context/projectTypeUtils';
import { readFile } from '../functions/File';
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
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';
import { regexTest } from '../functions/RegExp';

const BETA_VERSION_REGEX = /^.*-beta/;
const SNAPSHOT_VERSION_REGEX = /^.*-SNAPSHOT/;

const matchesPreReleaseRegex: P.Predicate<string> = pipe(
	regexTest(BETA_VERSION_REGEX),
	P.or(regexTest(SNAPSHOT_VERSION_REGEX))
);

const getVersionType = (version: string): VersionType =>
	match(version)
		.with(
			when<string>((_) => matchesPreReleaseRegex(_)),
			() => VersionType.PreRelease
		)
		.otherwise(() => VersionType.Release);

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
				versionType: getVersionType(version)
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
				versionType: getVersionType(packageJson.version)
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
				versionType: getVersionType(dockerJson.version)
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

const execute: StageExecuteFn = (context) =>
	pipe(
		readProjectInfoByType(context.projectType),
		E.map((_) => ({
			...context,
			projectInfo: _
		})),
		TE.fromEither
	);
const commandAllowsStage: P.Predicate<BuildContext> = () => true;
const projectAllowsStage: P.Predicate<BuildContext> = () => true;

export const getProjectInfo: Stage = {
	name: 'Get Project Info',
	execute,
	commandAllowsStage,
	projectAllowsStage
};
