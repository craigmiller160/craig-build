import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, P } from 'ts-pattern';
import { isMaven, isNpm } from '../context/projectTypeUtils';
import { runCommand } from '../command/runCommand';
import * as Pred from 'fp-ts/Predicate';
import { ProjectType } from '../context/ProjectType';
import { Stage, StageExecuteFn } from './Stage';
import { isFullBuild } from '../context/commandTypeUtils';

export const MAVEN_BUILD_CMD = 'mvn clean deploy -Ddependency-check.skip=true';
export const NPM_BUILD_CMD = 'yarn build';
export const GRADLE_BUILD_COMMAND = 'gradle clean build publish';

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
		.with({ projectType: P.when(isMaven) }, (_) =>
			runBuildCommand(_, MAVEN_BUILD_CMD)
		)
		.with({ projectType: P.when(isNpm) }, (_) =>
			runBuildCommand(_, NPM_BUILD_CMD)
		)
		.run();

const isMavenOrNpm: Pred.Predicate<ProjectType> = pipe(isMaven, Pred.or(isNpm));

const execute: StageExecuteFn = (context) =>
	handleBuildingArtifactByProject(context);

const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isMavenOrNpm(_.projectType),
	Pred.and((_) => isFullBuild(_.commandInfo.type))
);

export const buildArtifact: Stage = {
	name: 'Build Artifact',
	execute,
	shouldStageExecute
};
