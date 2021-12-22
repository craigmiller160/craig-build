import { Stage, StageFunction } from './Stage';
import path from 'path';
import { getCwd } from '../command/getCwd';
import fs from 'fs';
import { match, when } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';

const NPM_PROJECT_FILE = 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
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
			when<string>((_) => fileExists(_, DOCKER_PROJECT_FILE) && fileExists(_, DEPLOY_PATH)),
			() => E.right(ProjectType.DockerApplication)
		)
		.with(
			when<string>((_) => fileExists(_, DOCKER_PROJECT_FILE)),
			() => E.right(ProjectType.DockerImage)
		)
		.otherwise(() => E.left(new Error('Unable to identify ProjectType')));

const execute: StageFunction = (context) =>
	pipe(
		checkProjectFilesForType(),
		E.map((projectType) => ({
			...context,
			projectType: O.some(projectType)
		})),
		TE.fromEither
	);

export const getProjectType: Stage = {
	name: 'Get Project Type',
	execute
};
