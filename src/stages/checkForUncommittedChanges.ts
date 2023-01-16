import { Stage, StageExecuteFn } from './Stage';
import { runCommand } from '../command/runCommand';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import * as Pred from 'fp-ts/Predicate';
import { BuildContext } from '../context/BuildContext';
import { CommandType } from '../context/CommandType';
import { readUserInput } from '../utils/readUserInput';

const ERROR_MESSAGE = 'Cannot run with uncommitted changes';
export const GIT_COMMAND = 'git status --porcelain';

const isUserPromptCommand: Pred.Predicate<CommandType> = (type) =>
	[CommandType.TerraformOnly, CommandType.KubernetesOnly].includes(type);
const hasUncommittedChanges: Pred.Predicate<string> = (message) =>
	message.length > 0;

const handlePromptResult = (result: string): TE.TaskEither<Error, string> => {
	if (result.trim().toLowerCase() === 'y') {
		return TE.right('');
	}
	return TE.left(new Error(ERROR_MESSAGE));
};

const promptToProceed = (): TE.TaskEither<Error, string> =>
	pipe(
		readUserInput(
			'Uncommitted changes found, do you want to proceed? (y/n): '
		),
		TE.fromTask,
		TE.chain(handlePromptResult)
	);

const handleCommandResult = (
	context: BuildContext,
	message: string
): TE.TaskEither<Error, string> =>
	match({ commandType: context.commandInfo.type, message })
		.with(
			{
				commandType: P.when(isUserPromptCommand),
				message: P.when(hasUncommittedChanges)
			},
			promptToProceed
		)
		.with(
			{
				commandType: P.when(Pred.not(isUserPromptCommand)),
				message: P.when(hasUncommittedChanges)
			},
			() => TE.left(new Error(ERROR_MESSAGE))
		)
		.otherwise(() => TE.right(''));

const execute: StageExecuteFn = (context) =>
	pipe(
		runCommand(GIT_COMMAND),
		TE.chain((_) => handleCommandResult(context, _)),
		TE.map(() => context)
	);
const shouldStageExecute: Pred.Predicate<BuildContext> = () => true;

export const checkForUncommittedChanges: Stage = {
	name: 'Check For Uncommitted Changes',
	execute,
	shouldStageExecute
};
