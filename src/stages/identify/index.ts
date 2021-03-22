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
import checkForUncommittedChanges from './tasks/checkForUncommittedChanges';

const identify: StageFunction<undefined, ProjectInfo> = (context: StageContext<undefined>) =>
    pipe(
        checkForUncommittedChanges(undefined),
        TE.chain(identifyProject),
        TE.chain(getBaseProjectInfo),
        TE.chain(getKubeProjectInfo),
        TE.chain(getNexusProjectInfo(stageName)), // TODO I'm up to here
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            return {
                message: `Project information successfully identified: ${projectInfoString}`,
                value: projectInfo
            };
        })
    );

export default createStage(stageName, identify);
