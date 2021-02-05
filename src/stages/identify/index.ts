import identifyProject from './tasks/identifyProject';
import getBaseProjectInfo from './tasks/getBaseProjectInfo';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import { stageLogger, SUCCESS_STATUS } from '../../common/logger';
import { isApplication } from '../../utils/projectTypeUtils';
import getKubeProjectInfo from './tasks/getKubeProjectInfo';
import getNexusProjectInfo from './tasks/getNexusProjectInfo';
import createStage, { StageFunction } from '../../common/execution/stage';
import { Task } from '../../common/execution/task';

export const STAGE_NAME = 'Identify';

/*
 * 1. Create wrapper object containing
 *      a. Task
 *      b. Should execute rule. Returns undefined if should execute, otherwise returns message to log for skipping
 * 2. Create array of task wrappers.
 * 3. Iterate over this array, probably with a reduce to get a single output
 */

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
