import BuildError from '../../error/BuildError';

export interface StageContext<Input> {
    stageName: string;
    input: Input;
    createBuildError: (message: string) => BuildError;
}

export interface TaskContext<Input> extends StageContext<Input> {
    taskName: string;
}
