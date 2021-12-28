import { Stage } from '../stages/Stage';
import { StageExecutionStatus } from './StageExecutionStatus';

export interface StageExecution {
	readonly stage: Stage;
	readonly status: StageExecutionStatus;
}
