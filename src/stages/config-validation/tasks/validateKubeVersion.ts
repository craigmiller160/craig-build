import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { InputTask, Task } from '../../../types/Build';
import ProjectInfo from '../../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import { taskLogger } from '../../../common/logger';
import { STAGE_NAME } from '../index';
import BuildError from '../../../error/BuildError';

export const TASK_NAME = 'Validate Kubernetes Version';
const KUBE_PRE_RELEASE_VERSION = 'latest';

const createError = (message: string) =>
    new BuildError(message, {
        taskName: TASK_NAME,
        stageName: STAGE_NAME
    });

const validateKubeVersion: InputTask<ProjectInfo, ProjectInfo> = (projectInfo: ProjectInfo) => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    return pipe(
        O.fromNullable(projectInfo.kubernetesDockerImage),
        O.map((image: string) => {
            const parts = image.split(':');
            return parts[parts.length - 1];
        }),
        O.filter((version: string) => {
            if (projectInfo.isPreRelease) {
                return KUBE_PRE_RELEASE_VERSION === version;
            }

            return projectInfo.version === version;
        }),
        E.fromOption(() => {
            const version = projectInfo.version;
            const kubeImage = projectInfo.kubernetesDockerImage;
            return createError(`Invalid Kubernetes Version. Project Version: ${version} Kubernetes Image: ${kubeImage}`);
        }),
        E.map(() => projectInfo)
    );
};

export default validateKubeVersion;