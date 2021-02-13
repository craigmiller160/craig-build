import createStage, { StageFunction } from '../../common/execution/stage';
import ProjectInfo from '../../types/ProjectInfo';
import { StageContext } from '../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import dockerBuild from './tasks/dockerBuild';
import * as TE from 'fp-ts/TaskEither';
import kubeDeploy from './tasks/kubeDeploy';

export const STAGE_NAME = 'Deploy';

const deploy: StageFunction<ProjectInfo> = (context: StageContext<ProjectInfo>) =>
    pipe(
        dockerBuild(context.input),
        TE.chain(kubeDeploy),
        TE.map((projectInfo) => ({
            message: 'Deployment complete',
            value: projectInfo
        }))
    );

export default createStage(STAGE_NAME, deploy);
