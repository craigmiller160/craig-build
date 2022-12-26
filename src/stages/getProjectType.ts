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
	pipe(
		getAndCacheHelmProject(),
		E.exists((helmJson) => helmJson.type === 'application')
	);

const checkProjectFilesForType = (): E.Either<Error, ProjectType> =>
	match(getCwd())
		.when(
			(_) =>
				fileExists(_, NPM_PROJECT_FILE) &&
				fileExists(_, HELM_DEPLOY_FILE),
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
				fileExists(_, HELM_DEPLOY_FILE),
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
				fileExists(_, MAVEN_PROJECT_FILE) &&
				fileExists(_, HELM_DEPLOY_FILE),
			() => E.right(ProjectType.MavenApplication)
		)
		.when(
			(_) => fileExists(_, MAVEN_PROJECT_FILE),
			() => E.right(ProjectType.MavenLibrary)
		)
		.when(
			(_) =>
				fileExists(_, DOCKER_PROJECT_FILE) &&
				fileExists(_, HELM_DEPLOY_FILE),
			() => E.right(ProjectType.DockerApplication)
		)
		.when(
			(_) => fileExists(_, DOCKER_PROJECT_FILE),
			() => E.right(ProjectType.DockerImage)
		)
		.when(
			(_) => fileExists(_, HELM_PROJECT_FILE) && isHelmApplication(),
			() => E.right(ProjectType.HelmApplication)
		)
		.when(
			(_) => fileExists(_, HELM_PROJECT_FILE) && !isHelmApplication(),
			() => E.right(ProjectType.HelmLibrary)
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
