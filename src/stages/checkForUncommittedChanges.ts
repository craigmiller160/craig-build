import { Stage, StageFunction } from './Stage';
import { runCommand } from '../command/runCommand';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';

const GIT_COMMAND = 'git status --porcelain';

const handleCommandResult = (message: string): E.Either<Error, string> =>
	match(message)
		.with(
			when<string>((_) => _.length === 0),
			() => E.right('')
		)
		.otherwise(() =>
			E.left(new Error('Cannot run with uncommitted changes'))
		);

const execute: StageFunction = (context) =>
	pipe(
		runCommand(GIT_COMMAND),
		E.chain(handleCommandResult),
		TE.fromEither,
		TE.map(() => context)
	);

export const checkForUncommittedChanges: Stage = {
	name: 'Check For Uncommitted Changes',
	execute
};
