import { Stage, StageExecuteFn } from './Stage';
import { runCommand } from '../command/runCommand';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { match } from 'ts-pattern';
import * as Pred from 'fp-ts/Predicate';
import { BuildContext } from '../context/BuildContext';

export const GIT_COMMAND = 'git status --porcelain';

const handleCommandResult = (message: string): E.Either<Error, string> =>
	match(message)
		.when(
			(_) => _.length === 0,
			() => E.right('')
		)
		.otherwise(() =>
			E.left(new Error('Cannot run with uncommitted changes'))
		);

const execute: StageExecuteFn = (context) =>
	pipe(
		runCommand(GIT_COMMAND),
		TE.chain((_) => pipe(handleCommandResult(_), TE.fromEither)),
		TE.map(() => context)
	);
const shouldStageExecute: Pred.Predicate<BuildContext> = () => true;

export const checkForUncommittedChanges: Stage = {
	name: 'Check For Uncommitted Changes',
	execute,
	shouldStageExecute
};
