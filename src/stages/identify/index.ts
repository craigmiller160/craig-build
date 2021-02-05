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
import createStage, { StageFunction } from '../../common/execution/stage';

export const STAGE_NAME = 'Identify';

const identify: StageFunction<undefined,ProjectInfo> = () =>
    pipe(
        identifyProject(undefined), // TODO is there some more graceful way to deal with this?
        TE.chain(getBaseProjectInfo),
        TE.chain((projectInfo) => {
            if (isApplication(projectInfo.projectType)) {
                return getKubeProjectInfo(projectInfo);
            }
            return TE.right(projectInfo);
        }),
        TE.chain(getNexusProjectInfo),
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            stageLogger(STAGE_NAME, `Finished successfully. Project Info: ${projectInfoString}`, SUCCESS_STATUS);
            return {
                message: `Project information successfully identified: ${projectInfoString}`,
                value: projectInfo
            }
        })
    );

export default createStage(STAGE_NAME, identify);
