import createStage, { StageFunction } from '../../common/execution/stage';
import ProjectInfo from '../../types/ProjectInfo';
import { StageContext } from '../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import dockerBuild from './tasks/dockerBuild';
import * as TE from 'fp-ts/TaskEither';
import kubeDeploy from './tasks/kubeDeploy';
import stageName from './stageName';
import downloadArtifact from './tasks/downloadArtifact';
import wait from '../../utils/wait';

const deploy: StageFunction<ProjectInfo> = (context: StageContext<ProjectInfo>) => {
    context.logger('Waiting for Neuxs to update before deployment.');
    return pipe(
        wait(3000),
        TE.fromTask,
        TE.chain(() => downloadArtifact(context.input)), // TODO I'm here
        TE.chain(dockerBuild),
        TE.chain(kubeDeploy),
        TE.map((projectInfo) => ({
            message: 'Deployment complete',
            value: projectInfo
        }))
    );
}

export default createStage(stageName, deploy);
