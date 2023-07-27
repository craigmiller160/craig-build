import { Stage, StageExecuteFn } from './Stage';
import { runCommand } from '../command/runCommand';
import { function as func, predicate, taskEither } from 'fp-ts';
import { match } from 'ts-pattern';
import { BuildContext } from '../context/BuildContext';
import { readUserInput } from '../utils/readUserInput';

const ERROR_MESSAGE = 'Cannot run with uncommitted changes';
export const GIT_COMMAND = 'git status --porcelain';
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
	match(message)
		.when(hasUncommittedChanges, promptToProceed)
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
