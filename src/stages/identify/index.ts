import identifyProject from './tasks/identifyProject';
import getBaseProjectInfo from './tasks/getBaseProjectInfo';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import getKubeProjectInfo from './tasks/getKubeProjectInfo';
import getNexusProjectInfo from './tasks/getNexusProjectInfo';
import createStage, { StageFunction } from '../../common/execution/stage';
import { BuildTask } from '../../common/execution/task';
import { StageContext } from '../../common/execution/context';
import ProjectType from '../../types/ProjectType';
import conditionallyExecuteTask from '../../common/execution/conditionallyExecuteTask';

export const STAGE_NAME = 'Identify';

const identify: StageFunction<undefined, ProjectInfo> = (context: StageContext<undefined>) =>
    pipe(
        TE.of<Error,BuildTask<undefined, ProjectType>>(identifyProject),
        TE.chain((identifyProjectTask) => conditionallyExecuteTask(context, undefined, identifyProjectTask)),
        TE.chain((projectType) => conditionallyExecuteTask(context, projectType, getBaseProjectInfo)),
        TE.chain((projectInfo) => conditionallyExecuteTask(context, projectInfo, getKubeProjectInfo)),
        TE.chain((projectInfo) => conditionallyExecuteTask(context, projectInfo, getNexusProjectInfo)),
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            context.logger(`Project information successfully identified: ${projectInfoString}`);
            return {
                message: '',
                value: projectInfo
            };
        })
    );

export default createStage(STAGE_NAME, identify);
