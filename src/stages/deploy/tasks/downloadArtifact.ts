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
import { searchForMavenSnapshots, downloadArtifact as downloadArtifactApi } from '../../../common/services/NexusRepoApi';

export const TASK_NAME = 'Download Artifact';

const prepareDownloadDirectory = () => {
    const deployBuildDir = path.resolve(getCwd(), 'deploy', 'build');
    if (fs.existsSync(deployBuildDir)) {
        fs.rmSync(deployBuildDir, { recursive: true });
    }
    fs.mkdirSync(deployBuildDir);
};

const downloadMavenSnapshot = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> =>
    pipe(
        searchForMavenSnapshots(context.input.name),
        TE.map((nexusSearchResult) => nexusSearchResult.items[0].assets[0].downloadUrl),
        TE.chain((downloadUrl) => {
            const targetFileName = `${context.input.name}-${context.input.version}.jar`;
            const targetFilePath = path.resolve(getCwd(), 'deploy', 'build', targetFileName);
            context.logger(`Download URL: ${downloadUrl}`);
            context.logger(`Target File: ${targetFilePath}`);
            return downloadArtifactApi(downloadUrl, fs.createWriteStream(targetFilePath));
        }),
        TE.map(() => context.input)
    );

const downloadMavenRelease = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    return TE.left(new Error());
};

const doDownloadArtifact = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    if (isMaven(context.input.projectType) && context.input.isPreRelease) {
        return downloadMavenSnapshot(context);
    }

    if (isMaven(context.input.projectType)) {
        return downloadMavenRelease(context);
    }

    return TE.left(context.createBuildError(`Invalid project for downloading artifact: ${JSON.stringify(context.input)}`));
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