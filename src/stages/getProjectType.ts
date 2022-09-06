import { Stage, StageExecuteFn } from './Stage';
import path from 'path';
import { getCwd } from '../command/getCwd';
import fs from 'fs';
import { match } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as Pred from 'fp-ts/Predicate';
import * as TE from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';

const NPM_PROJECT_FILE = 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
const GRADLE_KOTLIN_PROJECT_FILE = 'build.gradle.kts';
const GRADLE_GROOVY_PROJECT_FILE = 'build.gradle';
const DOCKER_PROJECT_FILE = 'docker.json';
const DEPLOY_PATH = path.join('deploy', 'chart', 'Chart.yaml');

const fileExists = (cwd: string, file: string): boolean =>
	fs.existsSync(path.resolve(cwd, file));

const checkProjectFilesForType = (): E.Either<Error, ProjectType> =>
	match(getCwd())
		.when(
			(_) =>
				fileExists(_, NPM_PROJECT_FILE) && fileExists(_, DEPLOY_PATH),
			() => E.right(ProjectType.NpmApplication)
		)
		.when(
			(_) => fileExists(_, NPM_PROJECT_FILE),
			() => E.right(ProjectType.NpmLibrary)
		)
		.when(
			(_) =>
				(fileExists(_, GRADLE_KOTLIN_PROJECT_FILE) ||
					fileExists(_, GRADLE_GROOVY_PROJECT_FILE)) &&
				fileExists(_, DEPLOY_PATH),
			() => E.right(ProjectType.GradleApplication)
		)
		.when(
			(_) =>
				fileExists(_, GRADLE_KOTLIN_PROJECT_FILE) ||
				fileExists(_, GRADLE_GROOVY_PROJECT_FILE),
			() => E.right(ProjectType.GradleLibrary)
		)
		.when(
			(_) =>
				fileExists(_, MVN_PROJECT_FILE) && fileExists(_, DEPLOY_PATH),
			() => E.right(ProjectType.MavenApplication)
		)
		.when(
			(_) => fileExists(_, MVN_PROJECT_FILE),
			() => E.right(ProjectType.MavenLibrary)
		)
		.when(
			(_) =>
				fileExists(_, DOCKER_PROJECT_FILE) &&
				fileExists(_, DEPLOY_PATH),
			() => E.right(ProjectType.DockerApplication)
		)
		.when(
			(_) => fileExists(_, DOCKER_PROJECT_FILE),
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
const shouldStageExecute: Pred.Predicate<BuildContext> = () => true;

export const getProjectType: Stage = {
	name: 'Get Project Type',
	execute,
	shouldStageExecute
};
