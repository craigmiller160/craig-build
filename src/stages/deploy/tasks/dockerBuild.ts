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
import stageName from '../stageName';

export const TASK_NAME = 'Docker Build';

const DOCKER_REPO = 'craigmiller160.ddns.net:30004';

const createDockerLogin = (userName: string, password: string) =>
    `sudo docker login ${DOCKER_REPO} -u ${userName} -p ${password}`;
const createDockerBuild = (tag: string) =>
    `sudo docker build --network=host -t ${tag} .`;
const createDockerPush = (tag: string) =>
    `sudo docker push ${tag}`;
const createDockerRemoveMatch = (name: string, version: string) =>
    `sudo docker image ls | grep ${name} | grep ${version} | awk '{ print $3 }' | xargs docker image rm`
const createDockerFindMatch = (name: string, version: string) =>
    `sudo docker image ls | grep ${name} | grep ${version}`;

const removeExistingDockerImages = (context: TaskContext<ProjectInfo>): E.Either<Error, string> => {
    const tag = context.input.kubernetesDockerImage!!;
    const endIndex = tag.lastIndexOf(':');
    const name = tag.substring(0, endIndex);
    const version = tag.substring(endIndex);

    return pipe(
        runCommand(createDockerFindMatch(name, version)),
        E.chain((matches: string) => {
            if (matches.length > 0) {
                context.logger('Removing existing Docker image');
                return runCommand(createDockerRemoveMatch(name, version));
            }
            context.logger('No Docker images exist to remove');
            return E.right('');
        })
    );
};

const dockerBuild: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    const {
        NEXUS_DOCKER_USER,
        NEXUS_DOCKER_PASSWORD
    } = shellEnv.sync<EnvironmentVariables>();

    if (!context.input.kubernetesDockerImage) {
        return TE.left(context.createBuildError('Missing Kubernetes Docker Image'));
    }

    if (!NEXUS_DOCKER_USER || !NEXUS_DOCKER_PASSWORD) {
        return TE.left(context.createBuildError('Missing Docker credential environment variables'));
    }

    return pipe(
        runCommand(createDockerLogin(NEXUS_DOCKER_USER, NEXUS_DOCKER_PASSWORD), { logOutput: true }),
        E.chain(() => removeExistingDockerImages(context)),
        E.chain(() => runCommand(createDockerBuild(context.input.kubernetesDockerImage!!), { cwd: deployDir, logOutput: true })),
        E.chain(() => runCommand(createDockerPush(context.input.kubernetesDockerImage!!), { cwd: deployDir, logOutput: true })),
        TE.fromEither,
        TE.map(() => ({
            message: 'Docker build complete',
            value: context.input
        }))
    );
};

export default createTask(stageName, TASK_NAME, dockerBuild, executeIfApplication);
