import BuildError from '../../error/BuildError';
import { LogStatus } from '../logger';

export interface StageContext<Input> {
	stageName: string;
	input: Input;
	createBuildError: (message: string) => BuildError;
	logger: (message: string, status?: LogStatus) => void;
}

export interface TaskContext<Input> extends StageContext<Input> {
	taskName: string;
}
