import identify from './stages/identify';
import { buildLogger, ERROR_STATUS, SUCCESS_STATUS } from './common/logger';
import getCwd from './utils/getCwd';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { isBuildError } from './error/BuildError';
import ProjectInfo from './types/ProjectInfo';
import configValidation from './stages/config-validation';

// TODO no matter what type of error, need to know how far the service got

/*
 * TODO eventually delete this
 * Order of Operations
 *
 * 1. Self-Validation
 * 2. Identify
 * 3. Config Validation
 * 4. Build
 * 5. Publish
 * 6. Deploy
 * 7. Cleanup
 */

const execute = (): TE.TaskEither<Error, any> => { // TODO improve type here
    buildLogger(`Starting build for: ${getCwd()}`);

    return pipe(
        identify(undefined),
        TE.chain((projectInfo: ProjectInfo) => configValidation(projectInfo)),
        TE.map(() => {
            // TODO include more details on output
            buildLogger('Build finished successfully', SUCCESS_STATUS);
        }),
        TE.mapLeft((error) => {
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
