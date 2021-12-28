import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { pipe } from 'fp-ts/function';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import * as P from 'fp-ts/Predicate';

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
		.with({ projectInfo: when(isRelease) }, doGitTag)
		.run();

const execute: StageExecuteFn = (context) => handleGitTagByProject(context);
const commandAllowsStage: P.Predicate<BuildContext> = () => true;
const projectAllowsStage: P.Predicate<BuildContext> = (context) =>
	isRelease(context.projectInfo);

export const gitTag: Stage = {
	name: 'Git Tag',
	execute,
	commandAllowsStage,
	projectAllowsStage
};
