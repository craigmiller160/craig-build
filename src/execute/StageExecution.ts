import { Stage } from '../stages/Stage';
import { BuildContext } from '../context/BuildContext';
import { StageExecutionStatus } from './StageExecutionStatus';

export interface StageExecution {
	readonly stage: Stage;
	readonly context: BuildContext; // TODO see if there's some way to drop this
	readonly status: StageExecutionStatus;
}
