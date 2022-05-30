import { Stage, StageExecuteFn } from './Stage';
import path from 'path';
import { getCwd } from '../command/getCwd';
import fs from 'fs';
import { match, when } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as P from 'fp-ts/Predicate';
import * as TE from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';

const NPM_PROJECT_FILE = 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
const GRADLE_KOTLIN_PROJECT_FILE = 'build.gradle.kts';
const GRADLE_GROOVY_PROJECT_FILE = 'build.gradle';
const DOCKER_PROJECT_FILE = 'docker.json';
const DEPLOY_PATH = path.join('deploy', 'deployment.yml');

const fileExists = (cwd: string, file: string): boolean =>
	fs.existsSync(path.resolve(cwd, file));

const checkProjectFilesForType = (): E.Either<Error, ProjectType> =>
	match(getCwd())
		.with(
			when<string>(
				(_) =>
					fileExists(_, NPM_PROJECT_FILE) &&
					fileExists(_, DEPLOY_PATH)
			),
			() => E.right(ProjectType.NpmApplication)
		)
		.with(
			when<string>((_) => fileExists(_, NPM_PROJECT_FILE)),
			() => E.right(ProjectType.NpmLibrary)
		)
		.with(
			when<string>(
				(_) =>
					(fileExists(_, GRADLE_KOTLIN_PROJECT_FILE) ||
						fileExists(_, GRADLE_GROOVY_PROJECT_FILE)) &&
					fileExists(_, DEPLOY_PATH)
			),
			() => E.right(ProjectType.GradleApplication)
		)
		.with(
			when<string>(
				(_) =>
					fileExists(_, GRADLE_KOTLIN_PROJECT_FILE) ||
					fileExists(_, GRADLE_GROOVY_PROJECT_FILE)
			),
			() => E.right(ProjectType.GradleLibrary)
		)
		.with(
			when<string>(
				(_) =>
					fileExists(_, MVN_PROJECT_FILE) &&
					fileExists(_, DEPLOY_PATH)
			),
			() => E.right(ProjectType.MavenApplication)
		)
		.with(
			when<string>((_) => fileExists(_, MVN_PROJECT_FILE)),
			() => E.right(ProjectType.MavenLibrary)
		)
		.with(
			when<string>(
				(_) =>
					fileExists(_, DOCKER_PROJECT_FILE) &&
					fileExists(_, DEPLOY_PATH)
			),
			() => E.right(ProjectType.DockerApplication)
		)
		.with(
			when<string>((_) => fileExists(_, DOCKER_PROJECT_FILE)),
			() => E.right(ProjectType.DockerImage)
		)
		.otherwise(() => E.left(new Error('Unable to identify ProjectType')));

const execute: StageExecuteFn = (context) =>
	pipe(
		checkProjectFilesForType(),
		E.map((projectType) => ({
			...context,
			projectType: projectType
		})),
		TE.fromEither
	);
const shouldStageExecute: P.Predicate<BuildContext> = () => true;

export const getProjectType: Stage = {
	name: 'Get Project Type',
	execute,
	shouldStageExecute
};
