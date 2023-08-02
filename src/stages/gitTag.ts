import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { function as func } from 'fp-ts';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import { predicate } from 'fp-ts';
import { isFullBuild, isKubernetesOnly } from '../context/commandTypeUtils';
import { isDocker } from '../context/projectTypeUtils';

const doGitTag = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		runCommand(`git tag v${context.projectInfo.version}`),
		taskEither.chain(() => runCommand('git push --tags')),
		taskEither.map(() => context)
	);

const handleGitTagByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectInfo: P.when(isRelease) }, doGitTag)
		.run();

const isFullBuildAndReleaseVersion: predicate.Predicate<BuildContext> =
	func.pipe(
		(_: BuildContext) => isFullBuild(_.commandInfo.type),
		predicate.and((_) => isRelease(_.projectInfo))
	);
const isDockerReleaseProjectNoKubernetesOnly: predicate.Predicate<BuildContext> =
	func.pipe(
		(_: BuildContext) => isDocker(_.projectType),
		predicate.and((_) => isRelease(_.projectInfo)),
		predicate.and(
			predicate.not((_) => isKubernetesOnly(_.commandInfo.type))
		)
	);

const execute: StageExecuteFn = (context) => handleGitTagByProject(context);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => _.doGitTag,
	predicate.and(
		func.pipe(
			isFullBuildAndReleaseVersion,
			predicate.or(isDockerReleaseProjectNoKubernetesOnly)
		)
	)
);

export const gitTag: Stage = {
	name: 'Git Tag',
	execute,
	shouldStageExecute
};
