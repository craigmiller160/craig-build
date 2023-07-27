import { Stage, StageExecuteFn } from './Stage';
import { function as func } from 'fp-ts';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { match } from 'ts-pattern';
import { taskEither } from 'fp-ts';
import { either } from 'fp-ts';
import { predicate } from 'fp-ts';
import {
	isDocker,
	isGradle,
	isHelm,
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
import { HelmJson } from '../configFileTypes/HelmJson';
import { getNpmBuildTool } from '../context/npmCommandUtils';

const BETA_VERSION_REGEX = /^.*-beta/;
const SNAPSHOT_VERSION_REGEX = /^.*-SNAPSHOT/;

const matchesPreReleaseRegex: predicate.Predicate<string> = pipe(
	regexTest(BETA_VERSION_REGEX),
	predicate.or(regexTest(SNAPSHOT_VERSION_REGEX))
);

const getVersionType = (version: string): VersionType =>
	match(version)
		.when(
			(_) => matchesPreReleaseRegex(_),
			() => VersionType.PreRelease
		)
		.otherwise(() => VersionType.Release);

const readMavenProjectInfo = (
	projectType: ProjectType
): taskEither.TaskEither<Error, ProjectInfo> =>
func.pipe(
		getRawProjectData<PomXml>(projectType),
		taskEither.map((pomXml): ProjectInfo => {
			const version = pomXml.project.version[0];
			return {
				group: pomXml.project.groupId[0],
				name: pomXml.project.artifactId[0],
				version,
				versionType: getVersionType(version)
			};
		})
	);

const addNpmCommand = (
	projectInfo: ProjectInfo
): Either.Either<Error, ProjectInfo> =>
func.pipe(
		getNpmBuildTool(),
		Either.map(
			(npmCommand): ProjectInfo => ({
				...projectInfo,
				npmBuildTool: npmCommand
			})
		)
	);

const readNpmProjectInfo = (
	projectType: ProjectType
): taskEither.TaskEither<Error, ProjectInfo> =>
func.pipe(
		getRawProjectData<PackageJson>(projectType),
		taskEither.map((packageJson): ProjectInfo => {
			const [group, name] = npmSeparateGroupAndName(packageJson.name);
			return {
				group,
				name,
				version: packageJson.version,
				versionType: getVersionType(packageJson.version)
			};
		}),
		taskEither.chainEitherK(addNpmCommand)
	);

const readDockerProjectInfo = (
	projectType: ProjectType
): taskEither.TaskEither<Error, ProjectInfo> =>
func.pipe(
		getRawProjectData<DockerJson>(projectType),
		taskEither.map((dockerJson): ProjectInfo => {
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
): taskEither.TaskEither<Error, ProjectInfo> =>
func.pipe(
		getRawProjectData<GradleProject>(projectType),
		taskEither.map((buildGradle) => ({
			group: buildGradle.info.group,
			name: buildGradle.info.name,
			version: buildGradle.info.version,
			versionType: getVersionType(buildGradle.info.version)
		}))
	);

const readHelmProjectInfo = (
	projectType: ProjectType
): taskEither.TaskEither<Error, ProjectInfo> =>
func.pipe(
		getRawProjectData<HelmJson>(projectType),
		taskEither.map((helmJson): ProjectInfo => {
			const [group, name] = npmSeparateGroupAndName(helmJson.name);
			return {
				group,
				name,
				version: helmJson.version,
				versionType: getVersionType(helmJson.version)
			};
		}),
		taskEither.filterOrElse(
			(projectInfo) => projectInfo.versionType === VersionType.Release,
			() =>
				new Error(
					'Helm pre-release projects are not currently supported'
				)
		)
	);

const readProjectInfoByType = (
	projectType: ProjectType
): taskEither.TaskEither<Error, ProjectInfo> =>
	match(projectType)
		.when(isMaven, readMavenProjectInfo)
		.when(isNpm, readNpmProjectInfo)
		.when(isDocker, readDockerProjectInfo)
		.when(isGradle, readGradleProjectInfo)
		.when(isHelm, readHelmProjectInfo)
		.otherwise(() =>
			taskEither.left(new Error(`Unsupported ProjectType: ${projectType}`))
		);

const execute: StageExecuteFn = (context) =>
func.pipe(
		readProjectInfoByType(context.projectType),
		taskEither.map((_) => ({
			...context,
			projectInfo: _
		}))
	);
const shouldStageExecute: predicate.Predicate<BuildContext> = () => true;

export const getProjectInfo: Stage = {
	name: 'Get Project Info',
	execute,
	shouldStageExecute
};
