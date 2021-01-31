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

const getKubeProjectInfo: InputTask<ProjectInfo, ProjectInfo> = (projectInfo: ProjectInfo) => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    return pipe(
        findKubeProjectInfo(projectInfo),
        E.map((projectInfo) => {
            taskLogger(STAGE_NAME, TASK_NAME, 'Finished loading Kubernetes ProjectInfo successfully', SUCCESS_STATUS);
            return projectInfo;
        })
    );
};

export default getKubeProjectInfo;