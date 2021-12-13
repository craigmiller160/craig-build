import createTask, {TaskFunction, TaskShouldExecuteFunction} from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import {TaskContext} from '../../../common/execution/context';
import stageName from '../stageName';
import {executeIfPreRelease} from '../../../common/execution/commonTaskConditions';
import {isApplication, isDocker} from '../../../utils/projectTypeUtils';
import ProjectType from '../../../types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import {searchForMavenSnapshots, searchForNpmBetas} from '../../../common/services/NexusRepoApi';

export const TASK_NAME = 'Bump Docker Pre-Release Version';

const findNpmDockerPreReleaseVersion = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> =>
    pipe(
        searchForNpmBetas(context.input.group, context.input.name),
        TE.chain((results) => {
            if (results.items.length >= 1) {
                return TE.right(results.items[0].version);
            }

            return TE.left(context.createBuildError('Cannot find pre-release NPM artifact to determine pre-release Docker version'));
        }),
        TE.map((version): ProjectInfo => ({
            ...context.input,
            dockerPreReleaseVersion: version
        }))
    );

const findMavenDockerPreReleaseVersion = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> =>
    pipe(
        searchForMavenSnapshots(context.input.group, context.input.name),
        TE.chain((results) => {
            if (results.items.length >= 1) {
                return TE.right(results.items[0].version);
            }

            return TE.left(context.createBuildError('Cannot find pre-release Maven artifact to determine pre-release Docker version'));
        }),
        TE.map((version): ProjectInfo => ({
            ...context.input,
            dockerPreReleaseVersion: version
        }))
    );

const findDockerOnlyPreReleaseVersion = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    // TODO finish this
    throw new Error();
};

const handleBumpDockerPreReleaseVersion = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    switch (context.input.projectType) {
        case ProjectType.NpmApplication:
            return findNpmDockerPreReleaseVersion(context);
        case ProjectType.MavenApplication:
            return findMavenDockerPreReleaseVersion(context);
        case ProjectType.DockerApplication:
            return findDockerOnlyPreReleaseVersion(context);
        default:
            return TE.left(context.createBuildError(`Invalid ProjectType for bumping Docker beta: ${context.input.projectType}`));
    }
};

const bumpDockerPreReleaseVersion: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        handleBumpDockerPreReleaseVersion(context),
        TE.map((projectInfo) => ({
            message: `Bumped Docker pre-release version successfully: ${projectInfo.dockerPreReleaseVersion}`,
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