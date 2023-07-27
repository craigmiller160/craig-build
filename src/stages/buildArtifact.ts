import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { function as func } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isGradle, isMaven, isNpm } from '../context/projectTypeUtils';
import { runCommand } from '../command/runCommand';
import { predicate } from 'fp-ts';
import { ProjectType } from '../context/ProjectType';
import { Stage, StageExecuteFn } from './Stage';
import { isFullBuild } from '../context/commandTypeUtils';
import { getNpmBuildToolInstallCommand } from '../context/npmCommandUtils';

export const MAVEN_BUILD_CMD = 'mvn clean deploy -Ddependency-check.skip=true';
export const NPM_BUILD_CMD = 'npm run build';
export const GRADLE_BUILD_COMMAND = 'gradle clean build && gradle publish';

const runBuildCommand = (
	context: BuildContext,
	command: string
): taskEither.TaskEither<Error, BuildContext> =>
func.pipe(
		runCommand(command, { printOutput: true }),
		taskEither.map(() => context)
	);

const buildNpmProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const installCommand = getNpmBuildToolInstallCommand(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		context.projectInfo.npmBuildTool!
	);
	return pipe(
		runCommand(installCommand, { printOutput: true }),
		taskEither.chain(() => runBuildCommand(context, NPM_BUILD_CMD))
	);
};

const handleBuildingArtifactByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isMaven) }, (_) =>
			runBuildCommand(_, MAVEN_BUILD_CMD)
		)
		.with({ projectType: P.when(isNpm) }, buildNpmProject)
		.with({ projectType: P.when(isGradle) }, (_) =>
			runBuildCommand(_, GRADLE_BUILD_COMMAND)
		)
		.run();

const isMavenGradleNpm: predicate.Predicate<ProjectType> = pipe(
	isMaven,
	predicate.or(isNpm),
	predicate.or(isGradle)
);

const execute: StageExecuteFn = (context) =>
	handleBuildingArtifactByProject(context);

const shouldStageExecute: predicate.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isMavenGradleNpm(_.projectType),
	predicate.and((_) => isFullBuild(_.commandInfo.type))
);

export const buildArtifact: Stage = {
	name: 'Build Artifact',
	execute,
	shouldStageExecute
};
