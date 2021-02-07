import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import runCommand from '../../../utils/runCommand';
import shellEnv from 'shell-env';
import EnvironmentVariables from '../../../types/EnvironmentVariables';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import { STAGE_NAME } from '../index';
import BuildError from '../../../error/BuildError';
import fs from 'fs';

export const TASK_NAME = 'Deploy';

const DOCKER_REPO = 'craigmiller160.ddns.net:30004';
export const APPLY_CONFIGMAP = 'kubectl apply -f configmap.yml';
export const APPLY_DEPLOYMENT = 'kubectl apply -f deployment.yml';

const createDockerLogin = (userName: string, password: string) =>
    `sudo docker login ${DOCKER_REPO} -u ${userName} -p ${password}`;
const createDockerBuild = (tag: string) =>
    `sudo docker build --network=host -t ${tag} .`;
const createDockerPush = (tag: string) =>
    `sudo docker push ${tag}`;

const doDeploy: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    const {
        NEXUS_DOCKER_USER,
        NEXUS_DOCKER_PASSWORD
    } = shellEnv.sync<EnvironmentVariables>();

    if (!context.input.kubernetesDockerImage) {
        return TE.left(context.createBuildError('Missing Kubernetes Docker Image'));
    }

    return pipe(
        runCommand(createDockerLogin(NEXUS_DOCKER_USER, NEXUS_DOCKER_PASSWORD), { logOutput: true }),
        E.chain(() => runCommand(createDockerBuild(context.input.kubernetesDockerImage!!), { cwd: deployDir, logOutput: true })),
        E.chain(() => runCommand(createDockerPush(context.input.kubernetesDockerImage!!), { cwd: deployDir, logOutput: true })),
        E.chain(() => {
            const configmapPath = path.resolve(deployDir, 'configmap.yml');
            if (fs.existsSync(configmapPath)) {
                return runCommand(APPLY_CONFIGMAP, { cwd: deployDir, logOutput: true })
            }

            context.logger('No configmap in project');
            return E.right('');
        }),
        E.chain(() => runCommand(APPLY_DEPLOYMENT, { cwd: deployDir, logOutput: true })),
        TE.fromEither,
        TE.map(() => ({
            message: 'Deployment complete',
            value: context.input
        }))
    );
};

export default createTask(STAGE_NAME, TASK_NAME, doDeploy, executeIfApplication);
