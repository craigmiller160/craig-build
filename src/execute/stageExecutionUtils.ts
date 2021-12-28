import { Stage } from '../stages/Stage';
import { BuildContext } from '../context/BuildContext';
import { StageExecution } from './StageExecution';
import { StageExecutionStatus } from './StageExecutionStatus';
import { match, when } from 'ts-pattern';
import * as TE from 'fp-ts/TaskEither';
import { logger } from '../logger';

// TODO write tests for these

export const createStageExecution = (
	stage: Stage,
	context: BuildContext
): StageExecution => ({
	stage,
	context,
	status: StageExecutionStatus.Proceed
});

export const proceedIfCommandAllows = (
	execution: StageExecution
): StageExecution =>
	match(execution)
		.with(
			{
				status: StageExecutionStatus.Proceed,
				stage: when((stage) =>
					stage.commandAllowsStage(execution.context)
				)
			},
			(_) => _
		)
		.with({ status: StageExecutionStatus.SkipForProject }, (_) => _)
		.otherwise((_) => ({
			..._,
			status: StageExecutionStatus.SkipForCommand
		}));

export const proceedIfProjectAllows = (
	execution: StageExecution
): StageExecution =>
	match(execution)
		.with(
			{
				status: StageExecutionStatus.Proceed,
				stage: when((stage) =>
					stage.commandAllowsStage(execution.context)
				)
			},
			(_) => _
		)
		.with({ status: StageExecutionStatus.SkipForCommand }, (_) => _)
		.otherwise((_) => ({
			..._,
			status: StageExecutionStatus.SkipForCommand
		}));

export const executeIfAllowed = (
	execution: StageExecution
): TE.TaskEither<Error, BuildContext> =>
	match(execution)
		.with({ status: StageExecutionStatus.Proceed }, (_) =>
			_.stage.execute(_.context)
		)
		.otherwise(({ context, status }) => {
			logger.debug(`Skipping stage. Reason: ${status}`);
			return TE.right(context);
		});
