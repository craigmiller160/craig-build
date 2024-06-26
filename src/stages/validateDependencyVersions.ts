import { BuildContext } from '../context/BuildContext';
import {
	either,
	function as func,
	option,
	predicate,
	readonlyArray,
	readonlyNonEmptyArray,
	string,
	taskEither
} from 'fp-ts';
import { match, P } from 'ts-pattern';
import {
	isDocker,
	isGradle,
	isHelm,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { getCwd } from '../command/getCwd';
import { MavenArtifact, MavenModules, PomXml } from '../configFileTypes/PomXml';
import { PackageJson } from '../configFileTypes/PackageJson';
import { isRelease } from '../context/projectInfoUtils';
import { Stage, StageExecuteFn } from './Stage';
import { ProjectType } from '../context/ProjectType';
import { isFullBuild } from '../context/commandTypeUtils';
import { getRawProjectData } from '../projectReading';
import { runCommand } from '../command/runCommand';
import { semverSatisifies } from '../utils/semverUtils';
import path from 'path';

const MAVEN_PROPERTY_REGEX = /\${.*}/;

type MavenProperties = { [key: string]: string };
type PomAndProps = [PomXml, MavenProperties];
type JsEntries = ReadonlyArray<[string, string]>;

const getMavenProperties = (pomXml: PomXml): MavenProperties =>
	func.pipe(
		option.fromNullable(pomXml.project.properties),
		option.chain(readonlyArray.head),
		option.map((props) =>
			Object.entries(props).reduce(
				(mvnProps: MavenProperties, [key, value]) => {
					mvnProps[key] = func.pipe(
						value,
						readonlyArray.head,
						option.getOrElse(() => '')
					);
					return mvnProps;
				},
				{}
			)
		),
		option.getOrElse(() => ({}))
	);

const mavenFormatArtifactVersion = (dependency: MavenArtifact): string =>
	func.pipe(
		option.fromNullable(dependency.version),
		option.chain(readonlyArray.head),
		option.getOrElse(() => '')
	);

const mavenReplaceVersionProperty = (
	mvnProps: MavenProperties,
	version: string
): string =>
	match(version)
		.when(
			(_) => MAVEN_PROPERTY_REGEX.test(_),
			(_) => mvnProps[_.replace(/^\${/, '').replace(/}$/, '')]
		)
		.otherwise(() => version);

const PROJECT_PROP_REGEX = /^\${project\..+}$/;

const excludeIfUsingProjectProp = (version: string): boolean =>
	!PROJECT_PROP_REGEX.test(version);

const mavenHasNoSnapshotDependencies = ([
	pomXml,
	mvnProps
]: PomAndProps): boolean => {
	if (!pomXml.project.dependencies) {
		return true;
	}
	const hasNoSnapshotDependencies =
		func.pipe(
			pomXml.project.dependencies[0].dependency,
			readonlyArray.map(mavenFormatArtifactVersion),
			readonlyArray.filter(excludeIfUsingProjectProp),
			readonlyArray.filter((version) =>
				mavenReplaceVersionProperty(mvnProps, version).includes(
					'SNAPSHOT'
				)
			)
		).length === 0;
	const hasNoSnapshotPlugins =
		func.pipe(
			pomXml.project.build?.[0].plugins?.[0].plugin ?? [],
			readonlyArray.map(mavenFormatArtifactVersion),
			readonlyArray.filter(excludeIfUsingProjectProp),
			readonlyArray.filter((version) =>
				mavenReplaceVersionProperty(mvnProps, version).includes(
					'SNAPSHOT'
				)
			)
		).length === 0;

	return hasNoSnapshotDependencies && hasNoSnapshotPlugins;
};

const validateMavenPomXml = (
	context: BuildContext,
	cwd: string
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		getRawProjectData<PomXml>(context.projectType, cwd),
		taskEither.map(
			(pomXml): PomAndProps => [pomXml, getMavenProperties(pomXml)]
		),
		taskEither.filterOrElse(
			mavenHasNoSnapshotDependencies,
			() =>
				new Error(
					'Cannot have SNAPSHOT dependencies or plugins in Maven release'
				)
		),
		taskEither.map(() => context)
	);

const validateMavenReleaseDependencies = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const cwd = getCwd();
	return func.pipe(
		getRawProjectData<PomXml>(context.projectType, cwd),
		taskEither.flatMap((pomXml) => {
			if (pomXml.project.modules) {
				return func.pipe(
					pomXml.project.modules,
					readonlyArray.head,
					option.getOrElse((): MavenModules => ({ module: [] })),
					(m) => m.module,
					readonlyArray.map((module) => path.join(cwd, module)),
					readonlyArray.map((modulePath) =>
						validateMavenPomXml(context, modulePath)
					),
					taskEither.sequenceArray,
					taskEither.map(() => context)
				);
			}
			return validateMavenPomXml(context, cwd);
		})
	);
};

const entries = (obj?: { [key: string]: string }): JsEntries =>
	func.pipe(
		option.fromNullable(obj),
		option.map(Object.entries),
		option.getOrElse((): JsEntries => [])
	);

const validateNoBetaDependencies = (
	packageJson: PackageJson
): either.Either<Error, PackageJson> => {
	const hasBeta =
		func.pipe(
			entries(packageJson.dependencies),
			readonlyArray.concat(entries(packageJson.devDependencies)),
			readonlyArray.concat(entries(packageJson.peerDependencies)),
			readonlyArray.filter(([, value]) => value.includes('beta'))
		).length > 0;

	if (hasBeta) {
		return either.left(
			new Error('Cannot have beta dependencies in NPM release')
		);
	}
	return either.right(packageJson);
};

type PeerDependencyData = Readonly<{
	name: string;
	peerRange: string;
	mainDependencyVersion?: string;
	devDependencyVersion?: string;
}>;

const validatePeerDependencies = (
	packageJson: PackageJson
): either.Either<Error, PackageJson> =>
	func.pipe(
		entries(packageJson.peerDependencies),
		readonlyArray.map(
			([key, value]): PeerDependencyData => ({
				name: key,
				peerRange: value,
				mainDependencyVersion: packageJson.dependencies?.[key],
				devDependencyVersion: packageJson.devDependencies?.[key]
			})
		),
		readonlyArray.map((data) => {
			const validMainVersion =
				!data.mainDependencyVersion ||
				semverSatisifies(data.mainDependencyVersion, data.peerRange);
			const validDevVersion =
				!data.devDependencyVersion ||
				semverSatisifies(data.devDependencyVersion, data.peerRange);

			if (validMainVersion && validDevVersion) {
				return either.right(data);
			}

			const version =
				data.mainDependencyVersion ?? data.devDependencyVersion;

			return either.left(
				new Error(
					`Dependency ${data.name} does not satisfy project's peer range. Version: ${version} Range: ${data.peerRange}`
				)
			);
		}),
		either.sequenceArray,
		either.map(() => packageJson)
	);

const validateNpmDependencies = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const noBetaDependencies = isRelease(context.projectInfo)
		? validateNoBetaDependencies
		: (p: PackageJson) => either.right(p);

	return func.pipe(
		getRawProjectData<PackageJson>(context.projectType),
		taskEither.chainEitherK(noBetaDependencies),
		taskEither.chainEitherK(validatePeerDependencies),
		taskEither.map(() => context)
	);
};

const extractGradleVersions = (output: string): ReadonlyArray<string> =>
	func.pipe(
		output,
		string.split('\n'),
		readonlyArray.filter((_) => /^.*?--- /.test(_)),
		readonlyArray.map(string.trim),
		readonlyArray.map(string.replace(/^.*?---/, '')),
		readonlyArray.map(string.replace(/\([*|c]\)$/, '')),
		readonlyArray.map(string.replace(/ -> /, ':')),
		readonlyArray.filter(predicate.not(string.isEmpty)),
		readonlyArray.map(
			func.flow(string.split(':'), readonlyNonEmptyArray.last)
		)
	);

const hasSnapshotVersion = (output: string): boolean =>
	func.pipe(
		extractGradleVersions(output),
		readonlyArray.filter((version) => version.endsWith('SNAPSHOT'))
	).length === 0;

const validateGradleReleaseDependencies = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const hasSnapshotDependency = func.pipe(
		runCommand('gradle dependencies', {
			cwd: getCwd()
		}),
		taskEither.map(hasSnapshotVersion)
	);

	const hasSnapshotPlugin = func.pipe(
		runCommand('gradle buildEnvironment', {
			cwd: getCwd()
		}),
		taskEither.map(hasSnapshotVersion)
	);

	return func.pipe(
		taskEither.sequenceArray([hasSnapshotDependency, hasSnapshotPlugin]),
		taskEither.filterOrElse(
			([dependencyResult, pluginResult]) =>
				dependencyResult && pluginResult,
			() =>
				new Error(
					'Cannot have SNAPSHOT dependencies or plugins in Gradle release'
				)
		),
		taskEither.map(() => context)
	);
};

const handleValidationByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: P.when(isMaven), projectInfo: P.when(isRelease) },
			validateMavenReleaseDependencies
		)
		.with({ projectType: P.when(isNpm) }, validateNpmDependencies)
		.with(
			{ projectType: P.when(isGradle), projectInfo: P.when(isRelease) },
			validateGradleReleaseDependencies
		)
		.run();

const isNotDocker: predicate.Predicate<ProjectType> = predicate.not(isDocker);
const isNotHelm: predicate.Predicate<ProjectType> = predicate.not(isHelm);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const isNonDockerNonHelmRelease: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isNotDocker(_.projectType),
	predicate.and((_) => isNotHelm(_.projectType)),
	predicate.and((_) => isRelease(_.projectInfo))
);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	isNonDockerNonHelmRelease,
	predicate.and((_) => isFullBuild(_.commandInfo.type))
);

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute,
	shouldStageExecute
};
