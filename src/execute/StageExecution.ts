import { Stage } from '../stages/Stage';
import { BuildContext } from '../context/BuildContext';
import { StageExecutionStatus } from './StageExecutionStatus';

export interface StageExecution {
	readonly stage: Stage;
	readonly status: StageExecutionStatus;
}
