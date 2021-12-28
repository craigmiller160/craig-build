import { Stage } from '../../src/stages/Stage';
import { BuildContext } from '../../src/context/BuildContext';
import { StageExecutionStatus } from './StageExecutionStatus';

export interface StageExecution {
	readonly stage: Stage;
	readonly context: BuildContext; // TODO see if there's some way to drop this
	readonly status: StageExecutionStatus;
}
