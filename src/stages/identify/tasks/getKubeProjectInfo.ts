import ProjectInfo from '../../../types/ProjectInfo';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import yaml from 'yaml';
import fs from 'fs';
import KubeDeployment from '../../../types/KubeDeployment';
import handleUnknownError from '../../../utils/handleUnknownError';
import createTask, {
    TaskFunction,
} from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import stageName from '../stageName';

const TASK_NAME = 'Get Kubernetes Project Info';

const findKubeProjectInfo = (projectInfo: ProjectInfo): E.Either<Error, ProjectInfo> =>
    E.tryCatch(
        () => {
            const kubeDeploymentPath = path.resolve(getCwd(), 'deploy', 'deployment.yml');
            const kubeContent = fs.readFileSync(kubeDeploymentPath, 'utf8');
            const kubeDeploymentContent = kubeContent.split('---')[0];
            const kubeDeployment = yaml.parse(kubeDeploymentContent) as KubeDeployment;

            const craigAppContainerIndex = kubeDeployment.spec.template.spec.containers
                .findIndex((container) => container.image.includes('craigmiller160'));
            if (craigAppContainerIndex >= 0) {
                return {
                    ...projectInfo,
                    kubernetesDeploymentName: kubeDeployment.metadata.name,
                    kubernetesDockerImage: kubeDeployment.spec.template.spec.containers[craigAppContainerIndex].image
                };
            }
            return projectInfo;
        },
        handleUnknownError
    );

const getKubeProjectInfo: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        findKubeProjectInfo(context.input),
        E.map((result) => ({
            message: 'Loaded Kubernetes ProjectInfo',
            value: result
        })),
        TE.fromEither
    );

export default createTask(stageName, TASK_NAME, getKubeProjectInfo, [executeIfApplication]);
