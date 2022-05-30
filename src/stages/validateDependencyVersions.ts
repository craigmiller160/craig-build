import { BuildContext } from '../context/BuildContext';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import {
	isDocker,
	isGradleKotlin,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import * as TE from 'fp-ts/TaskEither';
import { getCwd } from '../command/getCwd';
import { MavenDependency, PomXml } from '../configFileTypes/PomXml';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as P from 'fp-ts/Predicate';
import { PackageJson } from '../configFileTypes/PackageJson';
import { isRelease } from '../context/projectInfoUtils';
import { Stage, StageExecuteFn } from './Stage';
import { ProjectType } from '../context/ProjectType';
import { isFullBuild } from '../context/commandTypeUtils';
import { GradleItem, readGradleProject } from '../special/gradle';
import { getRawProjectData } from '../projectCache';

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

const mavenFormatDependencyVersion = (dependency: MavenDependency): string =>
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
		.with(
			when<string>((_) => MAVEN_PROPERTY_REGEX.test(_)),
			(_) => mvnProps[_.replace(/^\${/, '').replace(/}$/, '')]
		)
		.otherwise(() => version);

const mavenHasSnapshotDependencies = ([
	pomXml,
	mvnProps
]: PomAndProps): boolean =>
	pipe(
		pomXml.project.dependencies[0].dependency,
		A.map(mavenFormatDependencyVersion),
		A.filter((version) =>
			mavenReplaceVersionProperty(mvnProps, version).includes('SNAPSHOT')
		)
	).length === 0;

const validateMavenReleaseDependencies = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		getRawProjectData<PomXml>(context.projectType),
		TE.map((pomXml): PomAndProps => [pomXml, getMavenProperties(pomXml)]),
		TE.filterOrElse(
			mavenHasSnapshotDependencies,
			() =>
				new Error('Cannot have SNAPSHOT dependencies in Maven release')
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

const gradleHasNoSnapshotDependencies = (
	dependencies: ReadonlyArray<GradleItem>
): boolean =>
	dependencies.filter((item) => item.version.includes('SNAPSHOT')).length ===
	0;

const validateGradleReleaseDependencies = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		readGradleProject(getCwd()),
		TE.filterOrElse(
			(_) => gradleHasNoSnapshotDependencies(_.dependencies),
			() =>
				new Error('Cannot have SNAPSHOT dependencies in Gradle release')
		),
		TE.map(() => context)
	);

const handleValidationByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: when(isMaven), projectInfo: when(isRelease) },
			validateMavenReleaseDependencies
		)
		.with(
			{ projectType: when(isNpm), projectInfo: when(isRelease) },
			validateNpmReleaseDependencies
		)
		.with(
			{ projectType: when(isGradleKotlin), projectInfo: when(isRelease) },
			validateGradleReleaseDependencies
		)
		.run();

const isNotDocker: P.Predicate<ProjectType> = P.not(isDocker);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const isNonDockerRelease: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isNotDocker(_.projectType),
	P.and((_) => isRelease(_.projectInfo))
);
const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	isNonDockerRelease,
	P.and((_) => isFullBuild(_.commandInfo.type))
);

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute,
	shouldStageExecute
};
