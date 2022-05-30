import { Stage, StageExecuteFn } from './Stage';
import { pipe } from 'fp-ts/function';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { match, when } from 'ts-pattern';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';
import {
	isDocker,
	isGradle,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { npmSeparateGroupAndName } from '../utils/npmSeparateGroupAndName';
import { PackageJson } from '../configFileTypes/PackageJson';
import { DockerJson } from '../configFileTypes/DockerJson';
import { PomXml } from '../configFileTypes/PomXml';
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';
import { regexTest } from '../functions/RegExp';
import { GradleProject } from '../special/gradle';
import { getRawProjectData } from '../projectCache';

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

const readMavenProjectInfo = (
	projectType: ProjectType
): TE.TaskEither<Error, ProjectInfo> =>
	pipe(
		getRawProjectData<PomXml>(projectType),
		TE.map((pomXml): ProjectInfo => {
			const version = pomXml.project.version[0];
			return {
				group: pomXml.project.groupId[0],
				name: pomXml.project.artifactId[0],
				version,
				versionType: getVersionType(version)
			};
		})
	);

const readNpmProjectInfo = (
	projectType: ProjectType
): TE.TaskEither<Error, ProjectInfo> =>
	pipe(
		getRawProjectData<PackageJson>(projectType),
		TE.map((packageJson): ProjectInfo => {
			const [group, name] = npmSeparateGroupAndName(packageJson.name);
			return {
				group,
				name,
				version: packageJson.version,
				versionType: getVersionType(packageJson.version)
			};
		})
	);

const readDockerProjectInfo = (
	projectType: ProjectType
): TE.TaskEither<Error, ProjectInfo> =>
	pipe(
		getRawProjectData<DockerJson>(projectType),
		TE.map((dockerJson): ProjectInfo => {
			const [group, name] = npmSeparateGroupAndName(dockerJson.name);
			return {
				group,
				name,
				version: dockerJson.version,
				versionType: getVersionType(dockerJson.version)
			};
		})
	);

const readGradleProjectInfo = (
	projectType: ProjectType
): TE.TaskEither<Error, ProjectInfo> =>
	pipe(
		getRawProjectData<GradleProject>(projectType),
		TE.map((buildGradle) => ({
			group: buildGradle.info.group,
			name: buildGradle.info.name,
			version: buildGradle.info.version,
			versionType: getVersionType(buildGradle.info.version)
		}))
	);

const readProjectInfoByType = (
	projectType: ProjectType
): TE.TaskEither<Error, ProjectInfo> =>
	match(projectType)
		.with(when(isMaven), readMavenProjectInfo)
		.with(when(isNpm), readNpmProjectInfo)
		.with(when(isDocker), readDockerProjectInfo)
		.with(when(isGradle), readGradleProjectInfo)
		.otherwise(() =>
			TE.left(new Error(`Unsupported ProjectType: ${projectType}`))
		);

const execute: StageExecuteFn = (context) =>
	pipe(
		readProjectInfoByType(context.projectType),
		TE.map((_) => ({
			...context,
			projectInfo: _
		}))
	);
const shouldStageExecute: P.Predicate<BuildContext> = () => true;

export const getProjectInfo: Stage = {
	name: 'Get Project Info',
	execute,
	shouldStageExecute
};
