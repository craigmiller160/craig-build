import { Stage, StageExecuteFn } from './Stage';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { match } from 'ts-pattern';
import {
	either,
	function as func,
	option,
	predicate,
	readonlyArray,
	taskEither
} from 'fp-ts';
import path from 'path';
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
import { MavenModules, PomXml } from '../configFileTypes/PomXml';
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';
import { regexTest } from '../functions/RegExp';
import { GradleProject } from '../special/gradle';
import { getRawProjectData } from '../projectReading';
import { HelmJson } from '../configFileTypes/HelmJson';
import { getNpmBuildTool } from '../context/npmCommandUtils';
import { getCwd } from '../command/getCwd';

const BETA_VERSION_REGEX = /^.*-beta/;
const SNAPSHOT_VERSION_REGEX = /^.*-SNAPSHOT/;

const matchesPreReleaseRegex: predicate.Predicate<string> = func.pipe(
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
	projectType: ProjectType,
	cwd: string = getCwd(),
	rootProjectInfo: ProjectInfo | undefined = undefined
): taskEither.TaskEither<Error, ProjectInfo> =>
	func.pipe(
		getRawProjectData<PomXml>(projectType, cwd),
		taskEither.flatMap((pomXml) => {
			const version =
				pomXml.project.version?.[0] ?? rootProjectInfo?.version;
			const group = pomXml.project.groupId?.[0] ?? rootProjectInfo?.group;
			if (!version || !group) {
				return taskEither.left(
					new Error('Cannot find required fields from pom.xml')
				);
			}

			const projectInfo: ProjectInfo = {
				group,
				name: pomXml.project.artifactId[0],
				version,
				versionType: getVersionType(version),
				repoType: rootProjectInfo !== undefined ? 'monrepo' : 'polyrepo'
			};

			if (
				pomXml.project.modules &&
				projectType === ProjectType.MavenApplication
			) {
				return taskEither.left(
					new Error('Monorepo not supported for this project type')
				);
			}

			if (pomXml.project.modules) {
				return func.pipe(
					pomXml.project.modules,
					readonlyArray.head,
					option.getOrElse((): MavenModules => ({ module: [] })),
					(m) => m.module,
					readonlyArray.map((module) => path.join(cwd, module)),
					readonlyArray.map((modulePath) =>
						readMavenProjectInfo(
							projectType,
							modulePath,
							projectInfo
						)
					),
					taskEither.sequenceArray,
					taskEither.map(
						(monorepoChildren): ProjectInfo => ({
							...projectInfo,
							monorepoChildren,
							repoType: 'monrepo'
						})
					)
				);
			}
			return taskEither.right(projectInfo);
		})
	);

const addNpmCommand = (
	projectInfo: ProjectInfo
): either.Either<Error, ProjectInfo> =>
	func.pipe(
		getNpmBuildTool(),
		either.map(
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
				versionType: getVersionType(packageJson.version),
				repoType: 'polyrepo'
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
				versionType: getVersionType(dockerJson.version),
				repoType: 'polyrepo'
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
			versionType: getVersionType(buildGradle.info.version),
			repoType: 'polyrepo'
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
				versionType: getVersionType(helmJson.version),
				repoType: 'polyrepo'
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
		.when(isMaven, (_) => readMavenProjectInfo(_))
		.when(isNpm, readNpmProjectInfo)
		.when(isDocker, readDockerProjectInfo)
		.when(isGradle, readGradleProjectInfo)
		.when(isHelm, readHelmProjectInfo)
		.otherwise(() =>
			taskEither.left(
				new Error(`Unsupported ProjectType: ${projectType}`)
			)
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
