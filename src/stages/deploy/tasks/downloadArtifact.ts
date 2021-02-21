import * as TE from 'fp-ts/TaskEither';
import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import stageName from '../stageName';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import { isMaven } from '../../../utils/projectTypeUtils';

export const TASK_NAME = 'Download Artifact';

const downloadMavenSnapshot = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    return TE.left(new Error());
};

const downloadMavenRelease = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    return TE.left(new Error());
};

const downloadArtifact: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    if (isMaven(context.input.projectType) && context.input.isPreRelease) {
        return downloadMavenSnapshot(context.input);
    }

    if (isMaven(context.input.projectType)) {
        return downloadMavenRelease(context.input);
    }

    // TODO improve this
    return TE.left(new Error());
};

export default createTask(stageName, TASK_NAME, downloadArtifact, executeIfApplication);