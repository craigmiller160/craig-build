import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { STAGE_NAME } from '../index';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import { pipe } from 'fp-ts/pipeable';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import runCommand from '../../../utils/runCommand';

export const TASK_NAME = 'Kubernetes Deployment';

export const APPLY_CONFIGMAP = 'kubectl apply -f configmap.yml';
export const APPLY_DEPLOYMENT = 'kubectl apply -f deployment.yml';

const applyConfigmap = (context: TaskContext<ProjectInfo>): E.Either<Error, string> => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    const configmapPath = path.resolve(deployDir, 'configmap.yml');
    if (fs.existsSync(configmapPath)) {
        return runCommand(APPLY_CONFIGMAP, { cwd: deployDir, logOutput: true })
    }

    context.logger('No configmap in project');
    return E.right('');
};

const applyDeployment = (): E.Either<Error, string> => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    return runCommand(APPLY_CONFIGMAP, { cwd: deployDir, logOutput: true });
};

const kubeDeploy: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const deployDir = path.resolve(getCwd(), 'deploy');

    return pipe(
        applyConfigmap(context),
        E.chain(applyDeployment),
        TE.fromEither,
        TE.map(() => ({
            message: 'Kubernetes deployment complete',
            value: context.input
        }))
    );
};

export default createTask(STAGE_NAME, TASK_NAME, kubeDeploy, executeIfApplication);
