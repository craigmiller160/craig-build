import createTask, {TaskFunction, TaskShouldExecuteFunction} from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import {TaskContext} from '../../../common/execution/context';
import stageName from '../stageName';
import {executeIfPreRelease} from '../../../common/execution/commonTaskConditions';
import {isApplication, isDocker} from '../../../utils/projectTypeUtils';
import ProjectType from '../../../types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';

export const TASK_NAME = 'Bump Docker Pre-Release Version';

const findNpmDockerPreReleaseVersion = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    // TODO finish this
    throw new Error();
};

const findMavenDockerPreReleaseVersion = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    // TODO finish this
    throw new Error();
};

const findDockerOnlyPreReleaseVersion = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    // TODO finish this
    throw new Error();
};

const handleBumpDockerPreReleaseVersion = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    switch (context.input.projectType) {
        case ProjectType.NpmApplication:
            return findNpmDockerPreReleaseVersion(context.input);
        case ProjectType.MavenApplication:
            return findMavenDockerPreReleaseVersion(context.input);
        case ProjectType.DockerApplication:
            return findDockerOnlyPreReleaseVersion(context.input);
        default:
            return TE.left(context.createBuildError(`Invalid ProjectType for bumping Docker beta: ${context.input.projectType}`));
    }
};

const bumpDockerPreReleaseVersion: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        handleBumpDockerPreReleaseVersion(context),
        TE.map((projectInfo) => ({
            message: 'Bumped Docker beta version successfully',
            value: projectInfo
        }))
    );

const shouldExecute: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (isDocker(input.projectType) || isApplication(input.projectType)) {
        return undefined;
    }

    return {
        message: 'Is not application or a Docker project',
        defaultResult: input
    };
};

export default createTask(stageName, TASK_NAME, bumpDockerPreReleaseVersion, [
    shouldExecute,
    executeIfPreRelease
]);