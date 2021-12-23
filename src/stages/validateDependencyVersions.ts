import { Stage, StageFunction } from './Stage';
import * as E from 'fp-ts/Either';
import { ProjectType } from '../context/ProjectType';
import { BuildContext } from '../context/BuildContext';
import {
	extractProjectInfo,
	extractProjectType
} from '../context/contextExtraction';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { isMaven, isNpm } from '../context/projectTypeUtils';
import { logger } from '../logger';
import * as TE from 'fp-ts/TaskEither';
import { readFile } from '../functions/readFile';
import { getCwd } from '../command/getCwd';
import path from 'path';
import {
	MAVEN_PROJECT_FILE,
	NPM_PROJECT_FILE
} from '../configFileTypes/constants';
import { parseXml } from '../functions/Xml';
import { MavenDependency, PomXml } from '../configFileTypes/PomXml';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { parseJson } from '../functions/Json';
import { PackageJson } from '../configFileTypes/PackageJson';

const MAVEN_PROPERTY_REGEX = /\${.*}/;

interface ExtractedValues {
	readonly projectType: ProjectType;
	readonly isPreRelease: boolean;
}

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
	values: ExtractedValues
): E.Either<Error, ExtractedValues> =>
	pipe(
		readFile(path.resolve(getCwd(), MAVEN_PROJECT_FILE)),
		E.chain((_) => parseXml<PomXml>(_)),
		E.map((pomXml): PomAndProps => [pomXml, getMavenProperties(pomXml)]),
		E.filterOrElse(
			mavenHasSnapshotDependencies,
			() =>
				new Error('Cannot have SNAPSHOT dependencies in Maven release')
		),
		E.map(() => values)
	);

const entries = (obj?: { [key: string]: string }): JsEntries =>
	pipe(
		O.fromNullable(obj),
		O.map(Object.entries),
		O.getOrElse((): JsEntries => [])
	);

const npmHasBetaDependencies = (dependencyEntries: JsEntries): boolean =>
	pipe(
		dependencyEntries,
		A.filter(([, value]) => value.includes('beta'))
	).length === 0;

const validateNpmReleaseDependencies = (
	values: ExtractedValues
): E.Either<Error, ExtractedValues> =>
	pipe(
		readFile(path.resolve(getCwd(), NPM_PROJECT_FILE)),
		E.chain((_) => parseJson<PackageJson>(_)),
		E.map((_) =>
			entries(_.dependencies).concat(entries(_.devDependencies))
		),
		E.filterOrElse(
			npmHasBetaDependencies,
			() => new Error('Cannot have beta dependencies in NPM release')
		),
		E.map(() => values)
	);

const extractValues = (
	context: BuildContext
): E.Either<Error, ExtractedValues> =>
	pipe(
		extractProjectType(context),
		E.chain((projectType) =>
			pipe(
				extractProjectInfo(context),
				E.map(
					(projectInfo): ExtractedValues => ({
						projectType,
						isPreRelease: projectInfo.isPreRelease
					})
				)
			)
		)
	);

const handleValidationByProject = (
	values: ExtractedValues
): E.Either<Error, ExtractedValues> =>
	match(values)
		.with(
			{ projectType: when(isMaven), isPreRelease: false },
			validateMavenReleaseDependencies
		)
		.with(
			{ projectType: when(isNpm), isPreRelease: false },
			validateNpmReleaseDependencies
		)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return E.right(values);
		});

const execute: StageFunction = (context) =>
	pipe(
		extractValues(context),
		E.chain(handleValidationByProject),
		E.map(() => context),
		TE.fromEither
	);

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute
};
