import { CustomError } from 'ts-custom-error';
import { BuildContext } from '../types/Build';

class BuildError extends CustomError {
    stageName: string = '';

    taskName: string = '';

    constructor(message: string, context?: BuildContext) {
        super(message);
        this.stageName = context?.stageName ?? '';
        this.taskName = context?.taskName ?? '';
    }
}

export default BuildError;
