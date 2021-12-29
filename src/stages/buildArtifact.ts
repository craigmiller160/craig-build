import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { isMaven, isNpm } from '../context/projectTypeUtils';
import { runCommand } from '../command/runCommand';
import * as P from 'fp-ts/Predicate';
import { ProjectType } from '../context/ProjectType';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import { isKubernetesOnly } from '../context/commandTypeUtils';

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
		.run();

const isMavenOrNpm: P.Predicate<ProjectType> = pipe(isMaven, P.or(isNpm));
const isNotKubernetesOnly: P.Predicate<CommandType> = P.not(isKubernetesOnly);

const execute: StageExecuteFn = (context) =>
	handleBuildingArtifactByProject(context);

const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isMavenOrNpm(_.projectType),
	P.and((_) => isNotKubernetesOnly(_.commandInfo.type))
);

export const buildArtifact: Stage = {
	name: 'Build Artifact',
	execute,
	shouldStageExecute
};
