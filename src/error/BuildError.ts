import { CustomError } from 'ts-custom-error';

class BuildError extends CustomError {
    constructor(message: string) {
        super(message);
    }
}

export default BuildError;
