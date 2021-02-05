import ProjectInfo from '../../../types/ProjectInfo';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import yaml from 'yaml';
import fs from 'fs';
import KubeDeployment from '../../../types/KubeDeployment';
import handleUnknownError from '../../../utils/handleUnknownError';
import { STAGE_NAME } from '../index';
import createTask, {
    TaskFunction,
    TaskGetDefaultResultFunction,
    TaskShouldExecuteFunction
} from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import { isApplication } from '../../../utils/projectTypeUtils';

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
        })),
        TE.fromEither
    );

const getDefaultResult: TaskGetDefaultResultFunction<ProjectInfo,ProjectInfo> = (input: ProjectInfo) => input;
const shouldExecute: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) =>
    isApplication(input.projectType) ? undefined : 'Project is not application';

export default createTask(STAGE_NAME, TASK_NAME, getKubeProjectInfo, shouldExecute, getDefaultResult);
