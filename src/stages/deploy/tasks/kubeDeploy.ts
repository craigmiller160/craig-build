import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import { pipe } from 'fp-ts/pipeable';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import runCommand from '../../../utils/runCommand';
import stageName from '../stageName';

export const TASK_NAME = 'Kubernetes Deployment';

export const APPLY_DEPLOYMENT = 'kubectl apply -f deployment.yml';
export const RESTART_APP_BASE = 'kubectl rollout restart deployment';
export const createApplyConfigmap = (fileName: string) => `kubectl apply -f ${fileName}`;

const applyConfigmap = (context: TaskContext<ProjectInfo>): E.Either<Error, string> => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    const configmapFileNames = (fs.readdirSync(deployDir) || [] )
        .filter((fileName) => fileName.endsWith('configmap.yml'));
    if (configmapFileNames.length === 0) {
        context.logger('No configmap in project');
        return E.right('');
    }

    return configmapFileNames
        .reduce<E.Either<Error,string>>((result, fileName) => {
            if (E.isLeft(result)) {
                return result;
            }

            return runCommand(createApplyConfigmap(fileName), { cwd: deployDir, logOutput: true })
        }, E.right(''));
};

const applyDeployment = (): E.Either<Error, string> => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    return runCommand(APPLY_DEPLOYMENT, { cwd: deployDir, logOutput: true });
};

const restartApp = (projectInfo: ProjectInfo): E.Either<Error, string> => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    return runCommand(`${RESTART_APP_BASE} ${projectInfo.kubernetesDeploymentName}`, {
        cwd: deployDir,
        logOutput: true
    });
}

const kubeDeploy: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const deployDir = path.resolve(getCwd(), 'deploy');

    return pipe(
        applyConfigmap(context),
        E.chain(applyDeployment),
        E.chain(() => restartApp(context.input)),
        TE.fromEither,
        TE.map(() => ({
            message: 'Kubernetes deployment complete',
            value: context.input
        }))
    );
};

export default createTask(stageName, TASK_NAME, kubeDeploy, [executeIfApplication]);
