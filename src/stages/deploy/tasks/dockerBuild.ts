import createTask, {TaskFunction, TaskShouldExecuteFunction} from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import {TaskContext} from '../../../common/execution/context';
import {pipe} from 'fp-ts/pipeable';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import runCommand from '../../../utils/runCommand';
import shellEnv from 'shell-env';
import EnvironmentVariables from '../../../types/EnvironmentVariables';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import stageName from '../stageName';
import {isApplication, isDocker} from "../../../utils/projectTypeUtils";

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
    `sudo docker image ls | grep ${name} | grep ${version} | cat`;

const removeExistingDockerImages = (context: TaskContext<ProjectInfo>, dockerImage: string): E.Either<Error, string> => {
    const endIndex = dockerImage.lastIndexOf(':');
    const name = dockerImage.substring(0, endIndex);
    const version = dockerImage.substring(endIndex + 1);

    return pipe(
        runCommand(createDockerFindMatch(name, version)),
        E.chain((matches: string) => {
            if (matches.length > 0) {
                context.logger('Removing existing Docker image');
                return runCommand(createDockerRemoveMatch(name, version), { logOutput: true });
            }
            context.logger('No Docker images exist to remove');
            return E.right('');
        })
    );
};

const getDockerImage = (projectInfo: ProjectInfo): O.Option<string> =>
    pipe(
        projectInfo.kubernetesDockerImage,
        O.fromNullable,
        O.fold(
            () => {
                if (isDocker(projectInfo.projectType)) {
                    return O.some(`${DOCKER_REPO}/${projectInfo.name}:${projectInfo.version}`);
                }
                return O.none;
            },
            (dockerImage) => O.some(dockerImage)
        )
    );

const dockerBuild: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const deployDir = path.resolve(getCwd(), 'deploy');
    const {
        NEXUS_DOCKER_USER,
        NEXUS_DOCKER_PASSWORD
    } = shellEnv.sync<EnvironmentVariables>();

    if (!NEXUS_DOCKER_USER || !NEXUS_DOCKER_PASSWORD) {
        return TE.left(context.createBuildError('Missing Docker credential environment variables'));
    }

    return pipe(
        getDockerImage(context.input),
        E.fromOption(() => context.createBuildError('Missing Kubernetes Docker Image')),
        E.chain((dockerImage) =>
            pipe(
                runCommand(createDockerLogin(NEXUS_DOCKER_USER, NEXUS_DOCKER_PASSWORD), { logOutput: true }),
                E.map(() => dockerImage)
            )
        ),
        E.chain((dockerImage: string) =>
            pipe(
                removeExistingDockerImages(context, dockerImage),
                E.map(() => dockerImage)
            )
        ),
        E.chain((dockerImage: string) =>
            pipe(
                runCommand(createDockerBuild(dockerImage), { cwd: deployDir, logOutput: true }),
                E.map(() => dockerImage)
            )
        ),
        E.chain((dockerImage: string) =>
            pipe(
                runCommand(createDockerPush(dockerImage), { cwd: deployDir, logOutput: true }),
                E.map(() => dockerImage)
            )
        ),
        TE.fromEither,
        TE.map(() => ({
            message: 'Docker build complete',
            value: context.input
        }))
    );
};

const shouldExecute: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (isDocker(input.projectType) || isApplication(input.projectType)) {
        return undefined;
    }

    return {
        message: 'Is not application or a Docker project',
        defaultResult: input
    };
};

export default createTask(stageName, TASK_NAME, dockerBuild, [shouldExecute]);
