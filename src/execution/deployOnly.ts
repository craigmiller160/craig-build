import * as TE from 'fp-ts/TaskEither';
import ProjectInfo from '../types/ProjectInfo';
import { buildLogger, ERROR_STATUS, SUCCESS_STATUS } from '../common/logger';
import getCwd from '../utils/getCwd';
import { pipe } from 'fp-ts/pipeable';
import identify from '../stages/identify';
import configValidation from '../stages/config-validation';
import deploy from '../stages/deploy';
import { isBuildError } from '../error/BuildError';

const deployOnly = (): TE.TaskEither<Error, ProjectInfo> => {
    buildLogger(`Deploying only ${getCwd()}`);

    return pipe(
        identify(undefined),
        TE.chain(configValidation),
        TE.chain(deploy),
        TE.map((projectInfo) => {
            buildLogger('Deploy only finished successfully', SUCCESS_STATUS);
            return projectInfo;
        }),
        TE.mapLeft((error) => {
            if (isBuildError(error)) {
                const message = `Deploy only failed on Stage ${error.stageName} and Task ${error.taskName}: ${error.message}`;
                buildLogger(message, ERROR_STATUS);
                console.error(error);
            } else {
                const message = `Deploy Only Error: ${error.message}`;
                buildLogger(message, ERROR_STATUS);
                console.error(error);
            }
            return error;
        })
    );
};

export default deployOnly;
