import { Stage, StageExecuteFn } from './Stage';
import { runCommand } from '../command/runCommand';
import { function as func } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { predicate } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';
import { CommandType } from '../context/CommandType';
import { readUserInput } from '../utils/readUserInput';

const ERROR_MESSAGE = 'Cannot run with uncommitted changes';
export const GIT_COMMAND = 'git status --porcelain';

const isUserPromptCommand: predicate.Predicate<CommandType> = (type) =>
	[CommandType.TerraformOnly, CommandType.KubernetesOnly].includes(type);
const hasUncommittedChanges: predicate.Predicate<string> = (message) =>
	message.length > 0;

const handlePromptResult = (
	result: string
): taskEither.TaskEither<Error, string> => {
	if (result.trim().toLowerCase() === 'y') {
		return taskEither.right('');
	}
	return taskEither.left(new Error(ERROR_MESSAGE));
};

const promptToProceed = (): taskEither.TaskEither<Error, string> =>
	func.pipe(
		readUserInput(
			'Uncommitted changes found, do you want to proceed? (y/n): '
		),
		taskEither.fromTask,
		taskEither.chain(handlePromptResult)
	);

const handleCommandResult = (
	context: BuildContext,
	message: string
): taskEither.TaskEither<Error, string> =>
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
				commandType: P.when(predicate.not(isUserPromptCommand)),
				message: P.when(hasUncommittedChanges)
			},
			() => taskEither.left(new Error(ERROR_MESSAGE))
		)
		.otherwise(() => taskEither.right(''));

const execute: StageExecuteFn = (context) =>
	func.pipe(
		runCommand(GIT_COMMAND),
		taskEither.chain((_) => handleCommandResult(context, _)),
		taskEither.map(() => context)
	);
const shouldStageExecute: predicate.Predicate<BuildContext> = () => true;

export const checkForUncommittedChanges: Stage = {
	name: 'Check For Uncommitted Changes',
	execute,
	shouldStageExecute
};
