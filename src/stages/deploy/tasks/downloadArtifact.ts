import * as TE from 'fp-ts/TaskEither';
import path from 'path';
import fs from 'fs';
import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import stageName from '../stageName';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import { isMaven } from '../../../utils/projectTypeUtils';
import { pipe } from 'fp-ts/pipeable';
import getCwd from '../../../utils/getCwd';

export const TASK_NAME = 'Download Artifact';

const prepareDownloadDirectory = () => {
    const deployBuildDir = path.resolve(getCwd(), 'deploy', 'build');
    if (fs.existsSync(deployBuildDir)) {
        fs.rmSync(deployBuildDir, { recursive: true });
    }
    fs.mkdirSync(deployBuildDir);
};

const downloadMavenSnapshot = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    return TE.left(new Error());
};

const downloadMavenRelease = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    return TE.left(new Error());
};

const doDownloadArtifact = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    if (isMaven(context.input.projectType) && context.input.isPreRelease) {
        return downloadMavenSnapshot(context.input);
    }

    if (isMaven(context.input.projectType)) {
        return downloadMavenRelease(context.input);
    }

    // TODO improve this
    return TE.left(new Error());
};

const downloadArtifact: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    prepareDownloadDirectory();
    return pipe(
        doDownloadArtifact(context),
        TE.map((projectInfo) => ({
            message: 'Successfully downloaded artifact',
            value: projectInfo
        }))
    );
};

export default createTask(stageName, TASK_NAME, downloadArtifact, executeIfApplication);