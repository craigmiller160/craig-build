import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { isNpm } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
import { runCommand } from '../command/runCommand';
import { ConditionalStage, StageExecuteFn } from './Stage';
import * as P from 'fp-ts/Predicate';

export const NPM_PUBLISH_COMMAND =
	'yarn publish --no-git-tag-version --new-version';

export const CLEAR_FILES_COMMAND = 'git checkout .';

const publishNpmArtifact = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		runCommand(`${NPM_PUBLISH_COMMAND} ${context.projectInfo.version}`, {
			printOutput: true
		}),
		TE.chain(() => runCommand(CLEAR_FILES_COMMAND)),
		TE.map(() => context)
	);

const handlePublishByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isNpm) }, publishNpmArtifact)
		.run();

const execute: StageExecuteFn<BuildContext> = (context) =>
	handlePublishByProject(context);
const commandAllowsStage: P.Predicate<BuildContext> = () => true;
const projectAllowsStage: P.Predicate<BuildContext> = (context) =>
	isNpm(context.projectType);

export const manuallyPublishArtifact: ConditionalStage = {
	name: 'Manually Publish Artifact',
	execute,
	commandAllowsStage,
	projectAllowsStage
};
