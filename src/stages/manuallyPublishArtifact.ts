import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isNpm } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
import { runCommand } from '../command/runCommand';

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
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handlePublishByProject(context);

export const manuallyPublishArtifact: Stage = {
	name: 'Manually Publish Artifact',
	execute
};
