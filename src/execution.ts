import identify from './stages/identify';
import { buildLogger, ERROR_STATUS, SUCCESS_STATUS } from './context/logger';
import getCwd from './utils/getCwd';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';
import { isBuildError } from './error/BuildError';

const execute = (): E.Either<Error, any> => { // TODO improve type here
    buildLogger(`Starting build for: ${getCwd()}`);

    return pipe(
        identify(),
        E.map(() => {
            // TODO include more details on output
            buildLogger('Build finished successfully', SUCCESS_STATUS);
        }),
        E.mapLeft((error) => {
            if (isBuildError(error)) {
                const message = `Build failed on Stage ${error.stageName} and Task ${error.taskName}: ${error.message}`;
                buildLogger(message, ERROR_STATUS);
                console.error(error);
            } else {
                const message = `Build Error: ${error.message}`;
                buildLogger(message, ERROR_STATUS);
                console.error(error);
            }
            return error;
        })
    );
};

export default execute;
