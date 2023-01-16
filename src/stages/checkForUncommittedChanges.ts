import { Stage, StageExecuteFn } from './Stage';
import { runCommand } from '../command/runCommand';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import * as Pred from 'fp-ts/Predicate';
import { BuildContext } from '../context/BuildContext';
import { CommandType } from '../context/CommandType';

export const GIT_COMMAND = 'git status --porcelain';

const isUserPromptCommand: Pred.Predicate<CommandType> = (type) =>
	[CommandType.TerraformOnly, CommandType.KubernetesOnly].includes(type);
const hasUncommittedChanges: Pred.Predicate<string> = (message) =>
	message.length > 0;

const handleCommandResult = (
	context: BuildContext,
	message: string
): E.Either<Error, string> =>
	match({ commandType: context.commandInfo.type, message })
		.with(
			{
				commandType: P.when(isUserPromptCommand),
				message: P.when(hasUncommittedChanges)
			},
			() => E.right('')
		)
		.with(
			{
				commandType: P.when(Pred.not(isUserPromptCommand)),
				message: P.when(hasUncommittedChanges)
			},
			() => E.left(new Error('Cannot run with uncommitted changes'))
		)
		.otherwise(() => E.right(''));

const execute: StageExecuteFn = (context) =>
	pipe(
		runCommand(GIT_COMMAND),
		TE.chain((_) => pipe(handleCommandResult(context, _), TE.fromEither)),
		TE.map(() => context)
	);
const shouldStageExecute: Pred.Predicate<BuildContext> = () => true;

export const checkForUncommittedChanges: Stage = {
	name: 'Check For Uncommitted Changes',
	execute,
	shouldStageExecute
};
