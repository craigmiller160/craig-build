import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { pipe } from 'fp-ts/function';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import * as Pred from 'fp-ts/Predicate';
import { isFullBuild, isKubernetesOnly } from '../context/commandTypeUtils';
import { isDocker } from '../context/projectTypeUtils';

const doGitTag = (context: BuildContext): TE.TaskEither<Error, BuildContext> =>
	pipe(
		runCommand(`git tag v${context.projectInfo.version}`),
		TE.chain(() => runCommand('git push --tags')),
		TE.map(() => context)
	);

const handleGitTagByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectInfo: P.when(isRelease) }, doGitTag)
		.run();

const isFullBuildAndReleaseVersion: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isFullBuild(_.commandInfo.type),
	Pred.and((_) => isRelease(_.projectInfo))
);
const isDockerReleaseProjectNoKubernetesOnly: Pred.Predicate<BuildContext> =
	pipe(
		(_: BuildContext) => isDocker(_.projectType),
		Pred.and((_) => isRelease(_.projectInfo)),
		Pred.and(Pred.not((_) => isKubernetesOnly(_.commandInfo.type)))
	);

const execute: StageExecuteFn = (context) => handleGitTagByProject(context);
const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	isFullBuildAndReleaseVersion,
	Pred.or(isDockerReleaseProjectNoKubernetesOnly)
);

export const gitTag: Stage = {
	name: 'Git Tag',
	execute,
	shouldStageExecute
};
