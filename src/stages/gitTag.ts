import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isRelease } from '../context/projectInfoUtils';

const doGitTag = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	throw new Error();
};

const handleGitTagByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectInfo: when(isRelease) }, doGitTag)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handleGitTagByProject(context);

export const gitTag: Stage = {
	name: 'Git Tag',
	execute
};
