
export interface StageContext<Input> {
    stageName: string;
    input: Input;
    createBuildError: (message: string) => void;
}

export interface TaskContext<Input> extends StageContext<Input> {
    taskName: string;
}
