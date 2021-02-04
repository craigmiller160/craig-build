import { CustomError } from 'ts-custom-error';
import { BuildContext } from '../types/Build';

// TODO figure out a better way of always guaranteeing stage name

class BuildError extends CustomError {
    stageName: string = '';

    taskName: string = '';

    constructor(message: string, context?: BuildContext) {
        super(message);
        this.stageName = context?.stageName ?? '';
        this.taskName = context?.taskName ?? '';
    }
}

export const isBuildError = (error: Error): error is BuildError => !!(error as any).stageName;

export default BuildError;
