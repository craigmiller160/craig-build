import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { InputTask, Task } from '../../../types/Build';
import ProjectInfo from '../../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import { taskLogger } from '../../../common/logger';
import { STAGE_NAME } from '../index';
import BuildError from '../../../error/BuildError';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';

export const TASK_NAME = 'Validate Kubernetes Version';
const KUBE_PRE_RELEASE_VERSION = 'latest';

const validateKubeVersion: TaskFunction<ProjectInfo, ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        O.fromNullable(context.input.kubernetesDockerImage),
        O.map((image: string) => {
            const parts = image.split(':');
            return parts[parts.length - 1];
        }),
        O.filter((version: string) => {
            if (context.input.isPreRelease) {
                return KUBE_PRE_RELEASE_VERSION === version;
            }

            return context.input.version === version;
        }),
        E.fromOption(() => {
            const version = context.input.version;
            const kubeImage = context.input.kubernetesDockerImage;
            return context.createBuildError(`Invalid Kubernetes Version. Project Version: ${version} Kubernetes Image: ${kubeImage}`);
        }),
        E.map(() => ({
            message: 'Successfully validated Kubernetes version',
            value: context.input
        })),
        TE.fromEither
    );

export default createTask(STAGE_NAME, TASK_NAME, validateKubeVersion);