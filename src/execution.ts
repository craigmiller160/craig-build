import identify from './stages/identify';
import { buildLogger, ERROR_STATUS, SUCCESS_STATUS } from './common/logger';
import getCwd from './utils/getCwd';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { isBuildError } from './error/BuildError';
import ProjectInfo from './types/ProjectInfo';
import configValidation from './stages/config-validation';
import createArtifact from './stages/createArtifact';
import cleanup from './stages/cleanup';
import deploy from './stages/deploy';

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

const execute = (): TE.TaskEither<Error, ProjectInfo> => {
    buildLogger(`Starting build for: ${getCwd()}`);

    return pipe(
        identify(undefined),
        TE.chain(configValidation),
        TE.chain(createArtifact),
        TE.chain(deploy),
        TE.chain(cleanup),
        TE.map((projectInfo) => {
            buildLogger('Build finished successfully', SUCCESS_STATUS);
            return projectInfo;
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
