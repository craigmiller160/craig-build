import { SetupStage, StageExecuteFn } from './Stage';
import { runCommand } from '../command/runCommand';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { IncompleteBuildContext } from '../context/IncompleteBuildContext';

export const GIT_COMMAND = 'git status --porcelain';

const handleCommandResult = (message: string): E.Either<Error, string> =>
	match(message)
		.with(
			when<string>((_) => _.length === 0),
			() => E.right('')
		)
		.otherwise(() =>
			E.left(new Error('Cannot run with uncommitted changes'))
		);

const execute: StageExecuteFn<IncompleteBuildContext> = (context) =>
	pipe(
		runCommand(GIT_COMMAND),
		TE.chain((_) => pipe(handleCommandResult(_), TE.fromEither)),
		TE.map(() => context)
	);

export const checkForUncommittedChanges: SetupStage = {
	name: 'Check For Uncommitted Changes',
	execute
};
