import identifyProject from './tasks/identifyProject';
import getBaseProjectInfo from './tasks/getBaseProjectInfo';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import getKubeProjectInfo from './tasks/getKubeProjectInfo';
import getNexusProjectInfo from '../../common/tasks/getNexusProjectInfo';
import createStage, { StageFunction } from '../../common/execution/stage';
import { StageContext } from '../../common/execution/context';
import stageName from './stageName';

const identify: StageFunction<undefined, ProjectInfo> = (context: StageContext<undefined>) =>
    pipe(
        identifyProject(undefined),
        TE.chain(getBaseProjectInfo),
        TE.chain(getKubeProjectInfo),
        TE.chain(getNexusProjectInfo),
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            return {
                message: `Project information successfully identified: ${projectInfoString}`,
                value: projectInfo
            };
        })
    );

export default createStage(stageName, identify);
