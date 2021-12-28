import { Stage } from '../stages/Stage';
import { BuildContext } from '../context/BuildContext';
import { StageExecution } from './StageExecution';
import { StageExecutionStatus } from './StageExecutionStatus';
import { match, when } from 'ts-pattern';
import * as TE from 'fp-ts/TaskEither';
import { logger } from '../logger';

export const createStageExecution = (stage: Stage): StageExecution => ({
	stage,
	status: StageExecutionStatus.Proceed
});

export const proceedIfCommandAllowed =
	(context: BuildContext) =>
	(execution: StageExecution): StageExecution =>
		match(execution)
			.with(
				{
					status: StageExecutionStatus.Proceed,
					stage: when((_) => _.commandAllowsStage(context))
				},
				(_) => _
			)
			.with({ status: StageExecutionStatus.SkipForProject }, (_) => _)
			.otherwise((_) => ({
				..._,
				status: StageExecutionStatus.SkipForCommand
			}));

export const proceedIfProjectAllowed =
	(context: BuildContext) =>
	(execution: StageExecution): StageExecution =>
		match(execution)
			.with(
				{
					status: StageExecutionStatus.Proceed,
					stage: when((_) => _.projectAllowsStage(context))
				},
				(_) => _
			)
			.with({ status: StageExecutionStatus.SkipForCommand }, (_) => _)
			.otherwise((_) => ({
				..._,
				status: StageExecutionStatus.SkipForProject
			}));

export const executeIfAllowed =
	(context: BuildContext) =>
	(execution: StageExecution): TE.TaskEither<Error, BuildContext> =>
		match(execution)
			.with({ status: StageExecutionStatus.Proceed }, (_) =>
				_.stage.execute(context)
			)
			.otherwise(({ status }) => {
				logger.debug(`Skipping stage. Reason: ${status}`);
				return TE.right(context);
			});
