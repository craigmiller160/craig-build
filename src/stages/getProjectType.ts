import { Stage, StageExecuteFn } from './Stage';
import path from 'path';
import { getCwd } from '../command/getCwd';
import fs from 'fs';
import { match } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import { either } from 'fp-ts';
import { function as func } from 'fp-ts';
import { predicate } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';
import {
	DOCKER_PROJECT_FILE,
	GRADLE_GROOVY_PROJECT_FILE,
	GRADLE_KOTLIN_PROJECT_FILE,
	HELM_DEPLOY_FILE,
	HELM_PROJECT_FILE,
	MAVEN_PROJECT_FILE,
	NPM_PROJECT_FILE
} from '../configFileTypes/constants';
import { getAndCacheHelmProject } from '../projectCache';

const fileExists = (cwd: string, file: string): boolean =>
	fs.existsSync(path.resolve(cwd, file));

const isHelmApplication = (): boolean =>
func.pipe(
		getAndCacheHelmProject(),
		either.exists((helmJson) => helmJson.type === 'application')
	);

const checkProjectFilesForType = (): either.Either<Error, ProjectType> =>
	match(getCwd())
		.when(
			(_) =>
				fileExists(_, NPM_PROJECT_FILE) &&
				fileExists(_, HELM_DEPLOY_FILE),
			() => either.right(ProjectType.NpmApplication)
		)
		.when(
			(_) => fileExists(_, NPM_PROJECT_FILE),
			() => either.right(ProjectType.NpmLibrary)
		)
		.when(
			(_) =>
				(fileExists(_, GRADLE_KOTLIN_PROJECT_FILE) ||
					fileExists(_, GRADLE_GROOVY_PROJECT_FILE)) &&
				fileExists(_, HELM_DEPLOY_FILE),
			() => either.right(ProjectType.GradleApplication)
		)
		.when(
			(_) =>
				fileExists(_, GRADLE_KOTLIN_PROJECT_FILE) ||
				fileExists(_, GRADLE_GROOVY_PROJECT_FILE),
			() => either.right(ProjectType.GradleLibrary)
		)
		.when(
			(_) =>
				fileExists(_, MAVEN_PROJECT_FILE) &&
				fileExists(_, HELM_DEPLOY_FILE),
			() => either.right(ProjectType.MavenApplication)
		)
		.when(
			(_) => fileExists(_, MAVEN_PROJECT_FILE),
			() => either.right(ProjectType.MavenLibrary)
		)
		.when(
			(_) =>
				fileExists(_, DOCKER_PROJECT_FILE) &&
				fileExists(_, HELM_DEPLOY_FILE),
			() => either.right(ProjectType.DockerApplication)
		)
		.when(
			(_) => fileExists(_, DOCKER_PROJECT_FILE),
			() => either.right(ProjectType.DockerImage)
		)
		.when(
			(_) => fileExists(_, HELM_PROJECT_FILE) && isHelmApplication(),
			() => either.right(ProjectType.HelmApplication)
		)
		.when(
			(_) => fileExists(_, HELM_PROJECT_FILE) && !isHelmApplication(),
			() => either.right(ProjectType.HelmLibrary)
		)
		.otherwise(() => either.left(new Error('Unable to identify ProjectType')));

const execute: StageExecuteFn = (context) =>
func.pipe(
		checkProjectFilesForType(),
		either.map((projectType) => ({
			...context,
			projectType: projectType
		})),
		taskEither.fromEither
	);
const shouldStageExecute: predicate.Predicate<BuildContext> = () => true;

export const getProjectType: Stage = {
	name: 'Get Project Type',
	execute,
	shouldStageExecute
};
