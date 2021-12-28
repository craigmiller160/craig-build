import { Stage } from '../../src/stages/Stage';
import { BuildContext } from '../../src/context/BuildContext';
import { StageExecution } from './StageExecution';
import { StageExecutionStatus } from './StageExecutionStatus';

export const createStageExecution = (
	stage: Stage,
	context: BuildContext
): StageExecution => ({
	stage,
	context,
	status: StageExecutionStatus.Proceed
});
