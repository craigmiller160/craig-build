import { BuildContext } from '../context/BuildContext';
import { function as func } from 'fp-ts';
import { match, P } from 'ts-pattern';
import {
	isDocker,
	isGradle,
	isHelm,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import {
	taskEither,
	string,
	readonlyArray,
	readonlyNonEmptyArray
} from 'fp-ts';
import { getCwd } from '../command/getCwd';
import { MavenArtifact, PomXml } from '../configFileTypes/PomXml';
import { array } from 'fp-ts';
import { option } from 'fp-ts';
import { predicate } from 'fp-ts';
import { PackageJson } from '../configFileTypes/PackageJson';
import { isRelease } from '../context/projectInfoUtils';
import { Stage, StageExecuteFn } from './Stage';
import { ProjectType } from '../context/ProjectType';
import { isFullBuild } from '../context/commandTypeUtils';
import { getRawProjectData } from '../projectCache';
import { runCommand } from '../command/runCommand';

const MAVEN_PROPERTY_REGEX = /\${.*}/;

type MavenProperties = { [key: string]: string };
type PomAndProps = [PomXml, MavenProperties];
type JsEntries = [string, string][];

const getMavenProperties = (pomXml: PomXml): MavenProperties =>
	func.pipe(
		option.fromNullable(pomXml.project.properties),
		option.chain(array.head),
		option.map((props) =>
			Object.entries(props).reduce(
				(mvnProps: MavenProperties, [key, value]) => {
					mvnProps[key] = func.pipe(
						value,
						array.head,
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
		option.chain(array.head),
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
			array.map(mavenFormatArtifactVersion),
			array.filter((version) =>
				mavenReplaceVersionProperty(mvnProps, version).includes(
					'SNAPSHOT'
				)
			)
		).length === 0;
	const hasNoSnapshotPlugins =
		func.pipe(
			pomXml.project.build?.[0].plugins?.[0].plugin ?? [],
			array.map(mavenFormatArtifactVersion),
			array.filter((version) =>
				mavenReplaceVersionProperty(mvnProps, version).includes(
					'SNAPSHOT'
				)
			)
		).length === 0;

	return hasNoSnapshotDependencies && hasNoSnapshotPlugins;
};

const validateMavenReleaseDependencies = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		getRawProjectData<PomXml>(context.projectType),
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

const entries = (obj?: { [key: string]: string }): JsEntries =>
	func.pipe(
		option.fromNullable(obj),
		option.map(Object.entries),
		option.getOrElse((): JsEntries => [])
	);

const npmHasNoBetaDependencies = (dependencyEntries: JsEntries): boolean =>
	func.pipe(
		dependencyEntries,
		array.filter(([, value]) => value.includes('beta'))
	).length === 0;

const validateNpmDependencies = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		getRawProjectData<PackageJson>(context.projectType),
		taskEither.map((_) =>
			entries(_.dependencies).concat(entries(_.devDependencies))
		),
		taskEither.filterOrElse(
			npmHasNoBetaDependencies,
			() => new Error('Cannot have beta dependencies in NPM release')
		),
		taskEither.map(() => context)
	);

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
