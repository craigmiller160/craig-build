import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isRelease } from '../context/projectInfoUtils';
import { runCommand } from '../command/runCommand';
import * as A from 'fp-ts/Array';

const executeGitTagValidation = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		runCommand('git tag'),
		TE.filterOrElse(
			(output) =>
				pipe(
					output.split('\n'),
					A.filter(
						(_) => _.trim() === `v${context.projectInfo.version}`
					)
				).length === 0,
			() =>
				new Error('Git tag for project release version already exists')
		),
		TE.map(() => context)
	);

const handleValidationByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectInfo: when(isRelease) }, executeGitTagValidation)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handleValidationByProject(context);

export const validateGitTag: Stage = {
	name: 'Validate Git Tag',
	execute
};
