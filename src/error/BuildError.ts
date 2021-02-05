import { CustomError } from 'ts-custom-error';

class BuildError extends CustomError {
    constructor(message: string, public stageName: string, public taskName?: string) {
        super(message);
    }
}

export const isBuildError = (error: Error): error is BuildError => !!(error as any).stageName;

export const createBuildError = (stageName: string, taskName?: string) => (message: string) =>
    new BuildError(message, stageName, taskName);

export default BuildError;
