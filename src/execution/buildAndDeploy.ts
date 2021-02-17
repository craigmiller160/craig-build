import * as TE from 'fp-ts/TaskEither';
import ProjectInfo from '../types/ProjectInfo';
import { buildLogger, ERROR_STATUS, SUCCESS_STATUS } from '../common/logger';
import getCwd from '../utils/getCwd';
import { pipe } from 'fp-ts/pipeable';
import identify from '../stages/identify';
import configValidation from '../stages/config-validation';
import createArtifact from '../stages/createArtifact';
import deploy from '../stages/deploy';
import cleanup from '../stages/cleanup';
import { isBuildError } from '../error/BuildError';

const buildAndDeploy = (): TE.TaskEither<Error, ProjectInfo> => {
    buildLogger(`Building and deploying ${getCwd()}`);

    return pipe(
        identify(undefined),
        TE.chain(configValidation),
        TE.chain(createArtifact),
        TE.chain(deploy),
        TE.chain(cleanup),
        TE.map((projectInfo) => {
            buildLogger('Build and deploy finished successfully', SUCCESS_STATUS);
            return projectInfo;
        }),
        TE.mapLeft((error) => {
            if (isBuildError(error)) {
                const message = `Build and deploy failed on Stage ${error.stageName} and Task ${error.taskName}: ${error.message}`;
                buildLogger(message, ERROR_STATUS);
                console.error(error);
            } else {
                const message = `Build and Deploy Error: ${error.message}`;
                buildLogger(message, ERROR_STATUS);
                console.error(error);
            }
            return error;
        })
    );
};

export default buildAndDeploy;
