import { InputTask } from '../../../types/Build';
import ProjectInfo from '../../../types/ProjectInfo';
import { SUCCESS_STATUS, taskLogger } from '../../../common/logger';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import yaml from 'yaml';
import fs from 'fs';
import KubeDeployment from '../../../types/KubeDeployment';
import handleUnknownError from '../../../utils/handleUnknownError';
import { STAGE_NAME } from '../index';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';

const TASK_NAME = 'Get Kubernetes Project Info';

const findKubeProjectInfo = (projectInfo: ProjectInfo): E.Either<Error, ProjectInfo> =>
    E.tryCatch(
        () => {
            const kubeDeploymentPath = path.resolve(getCwd(), 'deploy', 'deployment.yml');
            const kubeContent = fs.readFileSync(kubeDeploymentPath, 'utf8');
            const kubeDeploymentContent = kubeContent.split('---')[0];
            const kubeDeployment = yaml.parse(kubeDeploymentContent) as KubeDeployment;
            return {
                ...projectInfo,
                kubernetesDockerImage: kubeDeployment.spec.template.spec.containers[0].image
            };
        },
        handleUnknownError
    );

const getKubeProjectInfo: TaskFunction<ProjectInfo, ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        findKubeProjectInfo(context.input),
        E.map((result) => ({
            message: 'Loaded Kubernetes ProjectInfo',
            value: result
        }))
    )

export default createTask(STAGE_NAME, TASK_NAME, getKubeProjectInfo);
