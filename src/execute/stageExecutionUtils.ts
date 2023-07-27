import { Stage } from '../stages/Stage';
import { BuildContext } from '../context/BuildContext';
import { StageExecution } from './StageExecution';
import { StageExecutionStatus } from './StageExecutionStatus';
import { match, P } from 'ts-pattern';
import { taskEither } from 'fp-ts';
import { logger } from '../logger';

export const createStageExecution = (stage: Stage): StageExecution => ({
	stage,
	status: StageExecutionStatus.Proceed
});

export const shouldStageExecute =
	(context: BuildContext) =>
	(execution: StageExecution): StageExecution =>
		match(execution)
			.with(
				{ stage: P.when((_) => _.shouldStageExecute(context)) },
				(_) => _
			)
			.otherwise((_) => ({
				..._,
				status: StageExecutionStatus.Skip
			}));

export const executeIfAllowed =
	(context: BuildContext) =>
	(execution: StageExecution): taskEither.TaskEither<Error, BuildContext> =>
		match(execution)
			.with({ status: StageExecutionStatus.Proceed }, (_) =>
				_.stage.execute(context)
			)
			.otherwise(() => {
				logger.debug('Skipping stage');
				return taskEither.right(context);
			});
