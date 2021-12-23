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
import { PomXml } from '../configFileTypes/PomXml';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { parseJson } from '../functions/Json';
import { PackageJson } from '../configFileTypes/PackageJson';

interface ExtractedValues {
	readonly projectType: ProjectType;
	readonly isPreRelease: boolean;
}

const validateMavenReleaseDependencies = (
	values: ExtractedValues
): E.Either<Error, ExtractedValues> =>
	pipe(
		readFile(path.resolve(getCwd(), MAVEN_PROJECT_FILE)),
		E.chain((_) => parseXml<PomXml>(_)),
		E.filterOrElse(
			(pomXml) =>
				pipe(
					pomXml.project.dependencies[0].dependency,
					A.map((_) =>
						pipe(
							A.head(_.version),
							O.getOrElse(() => '')
						)
					),
					A.filter((_) => _.includes('SNAPSHOT'))
				).length === 0,
			() =>
				new Error('Cannot have SNAPSHOT dependencies in Maven release')
		),
		E.map(() => values)
	);

const entries = (obj?: { [key: string]: string }): [string, string][] =>
	pipe(
		O.fromNullable(obj),
		O.map(Object.entries),
		O.getOrElse((): [string, string][] => [])
	);

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
			(dependencyEntries) =>
				pipe(
					dependencyEntries,
					A.filter(([, value]) => value.includes('beta'))
				).length === 0,
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
			{ projectType: when(isMaven), isPreRelease: true },
			validateMavenReleaseDependencies
		)
		.with(
			{ projectType: when(isNpm), isPreRelease: true },
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
