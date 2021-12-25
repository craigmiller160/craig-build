import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isMaven, isNpm } from '../context/projectTypeUtils';
import { runCommand } from '../command/runCommand';

export const MAVEN_BUILD_CMD = 'mvn clean deploy -Ddependency-check.skip=true';
export const NPM_BUILD_CMD = 'yarn build';

const runBuildCommand = (
	context: BuildContext,
	command: string
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		runCommand(command, { printOutput: true }),
		TE.map(() => context)
	);

const handleBuildingArtifactByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isMaven) }, (_) =>
			runBuildCommand(_, MAVEN_BUILD_CMD)
		)
		.with({ projectType: when(isNpm) }, (_) =>
			runBuildCommand(_, NPM_BUILD_CMD)
		)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) =>
	handleBuildingArtifactByProject(context);

export const buildArtifact: Stage = {
	name: 'Build Artifact',
	execute
};
