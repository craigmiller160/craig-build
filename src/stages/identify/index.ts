import identifyProject from './tasks/identifyProject';
import getBaseProjectInfo from './tasks/getBaseProjectInfo';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import { AsyncStage, Stage } from '../../types/Build';
import { stageLogger, SUCCESS_STATUS } from '../../common/logger';
import { isBuildError } from '../../error/BuildError';
import { isApplication } from '../../utils/projectTypeUtils';
import getKubeProjectInfo from './tasks/getKubeProjectInfo';
import getNexusProjectInfo from './tasks/getNexusProjectInfo';

export const STAGE_NAME = 'Identify';

const identify: AsyncStage<ProjectInfo> = () => {
    stageLogger(STAGE_NAME, 'Starting...');
    return pipe(
        identifyProject(),
        E.chain(getBaseProjectInfo),
        E.chain((projectInfo) => {
            if (isApplication(projectInfo.projectType)) {
                return getKubeProjectInfo(projectInfo);
            }
            return E.right(projectInfo);
        }),
        TE.fromEither,
        TE.chain(getNexusProjectInfo),
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            stageLogger(STAGE_NAME, `Finished successfully. Project Info: ${projectInfoString}`, SUCCESS_STATUS);
            return projectInfo;
        }),
        TE.mapLeft((error) => {
            if (isBuildError(error)) {
                error.stageName = STAGE_NAME;
            }
            return error;
        })
    );
};

export default identify;
