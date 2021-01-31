import identifyProject from './tasks/identifyProject';
import getProjectConfig from './tasks/getBaseProjectInfo';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import { Stage } from '../../types/Build';
import { stageLogger, SUCCESS_STATUS } from '../../context/logger';
import { isBuildError } from '../../error/BuildError';
import { isApplication } from '../../utils/projectTypeUtils';
import getKubeProjectInfo from './tasks/getKubeProjectInfo';

export const STAGE_NAME = 'Identify';

const identify: Stage<ProjectInfo> = () => {
    stageLogger(STAGE_NAME, 'Starting...');
    return pipe(
        identifyProject(),
        E.chain((projectType) => getProjectConfig(projectType)),
        E.chain((projectInfo) => {
            if (isApplication(projectInfo.projectType)) {
                return getKubeProjectInfo(projectInfo);
            }
            return E.right(projectInfo);
        }),
        E.map((projectInfo) => {
            stageLogger(STAGE_NAME, 'Finished successfully', SUCCESS_STATUS);
            return projectInfo;
        }),
        E.mapLeft((error) => {
            if (isBuildError(error)) {
                error.stageName = STAGE_NAME;
            }
            return error;
        })
    );
};

export default identify;
