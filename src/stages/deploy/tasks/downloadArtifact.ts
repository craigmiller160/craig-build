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
import {
    searchForMavenSnapshots,
    downloadArtifact as downloadArtifactApi,
    NexusRepoSearchFn, searchForMavenReleases
} from '../../../common/services/NexusRepoApi';

// TODO NPM will need a wildcard at the end of the pre-release version. aka 1.0.0-beta*

export const TASK_NAME = 'Download Artifact';

const prepareDownloadDirectory = () => {
    const deployBuildDir = path.resolve(getCwd(), 'deploy', 'build');
    if (fs.existsSync(deployBuildDir)) {
        fs.rmSync(deployBuildDir, { recursive: true });
    }
    fs.mkdirSync(deployBuildDir);
};

const executeDownload = (context: TaskContext<ProjectInfo>, searchFn: NexusRepoSearchFn) =>
    pipe(
        searchFn(context.input.name, context.input.version),
        TE.chain((nexusSearchResult) => {
            if (nexusSearchResult.items.length > 0) {
                return TE.right(nexusSearchResult.items[0].assets[0].downloadUrl);
            }
            return TE.left(context.createBuildError(`Unable to find artifact in nexus. ` +
                `${context.input.projectType} ${context.input.name} ${context.input.version}`));
        }),
        TE.chain((downloadUrl) => {
            const targetFileName = `${context.input.name}-${context.input.version}.jar`;
            const targetFilePath = path.resolve(getCwd(), 'deploy', 'build', targetFileName);
            context.logger(`Download URL: ${downloadUrl}`);
            context.logger(`Target File: ${targetFilePath}`);
            return downloadArtifactApi(downloadUrl, targetFilePath);
        }),
        TE.map((result) => context.input)
    );

const doDownloadArtifact = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    if (isMaven(context.input.projectType) && context.input.isPreRelease) {
        return executeDownload(context, searchForMavenSnapshots);
    }

    if (isMaven(context.input.projectType)) {
        return executeDownload(context, searchForMavenReleases);
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