import { BuildContext } from '../context/BuildContext';
import { flow, pipe } from 'fp-ts/function';
import { match, P } from 'ts-pattern';
import {
	isDocker,
	isGradle,
	isHelm,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { taskEither } from 'fp-ts';
import * as S from 'fp-ts/string';
import { getCwd } from '../command/getCwd';
import { MavenArtifact, PomXml } from '../configFileTypes/PomXml';
import { array } from 'fp-ts';
import * as RArray from 'fp-ts/ReadonlyArray';
import * as RNonEmptyArray from 'fp-ts/ReadonlyNonEmptyArray';
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
	pipe(
		O.fromNullable(pomXml.project.properties),
		O.chain(A.head),
		O.map((props) =>
			Object.entries(props).reduce(
				(mvnProps: MavenProperties, [key, value]) => {
					mvnProps[key] = pipe(
						value,
						A.head,
						O.getOrElse(() => '')
					);
					return mvnProps;
				},
				{}
			)
		),
		O.getOrElse(() => ({}))
	);

const mavenFormatArtifactVersion = (dependency: MavenArtifact): string =>
	pipe(
		O.fromNullable(dependency.version),
		O.chain(A.head),
		O.getOrElse(() => '')
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
		pipe(
			pomXml.project.dependencies[0].dependency,
			A.map(mavenFormatArtifactVersion),
			A.filter((version) =>
				mavenReplaceVersionProperty(mvnProps, version).includes(
					'SNAPSHOT'
				)
			)
		).length === 0;
	const hasNoSnapshotPlugins =
		pipe(
			pomXml.project.build?.[0].plugins?.[0].plugin ?? [],
			A.map(mavenFormatArtifactVersion),
			A.filter((version) =>
				mavenReplaceVersionProperty(mvnProps, version).includes(
					'SNAPSHOT'
				)
			)
		).length === 0;

	return hasNoSnapshotDependencies && hasNoSnapshotPlugins;
};

const validateMavenReleaseDependencies = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		getRawProjectData<PomXml>(context.projectType),
		TE.map((pomXml): PomAndProps => [pomXml, getMavenProperties(pomXml)]),
		TE.filterOrElse(
			mavenHasNoSnapshotDependencies,
			() =>
				new Error(
					'Cannot have SNAPSHOT dependencies or plugins in Maven release'
				)
		),
		TE.map(() => context)
	);

const entries = (obj?: { [key: string]: string }): JsEntries =>
	pipe(
		O.fromNullable(obj),
		O.map(Object.entries),
		O.getOrElse((): JsEntries => [])
	);

const npmHasNoBetaDependencies = (dependencyEntries: JsEntries): boolean =>
	pipe(
		dependencyEntries,
		A.filter(([, value]) => value.includes('beta'))
	).length === 0;

const validateNpmReleaseDependencies = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		getRawProjectData<PackageJson>(context.projectType),
		TE.map((_) =>
			entries(_.dependencies).concat(entries(_.devDependencies))
		),
		TE.filterOrElse(
			npmHasNoBetaDependencies,
			() => new Error('Cannot have beta dependencies in NPM release')
		),
		TE.map(() => context)
	);

const extractGradleVersions = (output: string): ReadonlyArray<string> =>
	pipe(
		output,
		S.split('\n'),
		RArray.filter((_) => /^.*?--- /.test(_)),
		RArray.map(S.trim),
		RArray.map(S.replace(/^.*?---/, '')),
		RArray.map(S.replace(/\([*|c]\)$/, '')),
		RArray.map(S.replace(/ -> /, ':')),
		RArray.filter(Pred.not(S.isEmpty)),
		RArray.map(flow(S.split(':'), RNonEmptyArray.last))
	);

const hasSnapshotVersion = (output: string): boolean =>
	pipe(
		extractGradleVersions(output),
		RArray.filter((version) => version.endsWith('SNAPSHOT'))
	).length === 0;

const validateGradleReleaseDependencies = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const hasSnapshotDependency = pipe(
		runCommand('gradle dependencies', {
			cwd: getCwd()
		}),
		TE.map(hasSnapshotVersion)
	);

	const hasSnapshotPlugin = pipe(
		runCommand('gradle buildEnvironment', {
			cwd: getCwd()
		}),
		TE.map(hasSnapshotVersion)
	);

	return pipe(
		TE.sequenceArray([hasSnapshotDependency, hasSnapshotPlugin]),
		TE.filterOrElse(
			([dependencyResult, pluginResult]) =>
				dependencyResult && pluginResult,
			() =>
				new Error(
					'Cannot have SNAPSHOT dependencies or plugins in Gradle release'
				)
		),
		TE.map(() => context)
	);
};

const handleValidationByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: P.when(isMaven), projectInfo: P.when(isRelease) },
			validateMavenReleaseDependencies
		)
		.with(
			{ projectType: P.when(isNpm), projectInfo: P.when(isRelease) },
			validateNpmReleaseDependencies
		)
		.with(
			{ projectType: P.when(isGradle), projectInfo: P.when(isRelease) },
			validateGradleReleaseDependencies
		)
		.run();

const isNotDocker: Pred.Predicate<ProjectType> = Pred.not(isDocker);
const isNotHelm: Pred.Predicate<ProjectType> = Pred.not(isHelm);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const isNonDockerNonHelmRelease: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isNotDocker(_.projectType),
	Pred.and((_) => isNotHelm(_.projectType)),
	Pred.and((_) => isRelease(_.projectInfo))
);
const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	isNonDockerNonHelmRelease,
	Pred.and((_) => isFullBuild(_.commandInfo.type))
);

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute,
	shouldStageExecute
};
