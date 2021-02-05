import { AsyncInputTask, InputTask } from '../../../types/Build';
import ProjectInfo from '../../../types/ProjectInfo';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { SUCCESS_STATUS, taskLogger } from '../../../common/logger';
import { STAGE_NAME } from '../index';
import ProjectType from '../../../types/ProjectType';
import BuildError from '../../../error/BuildError';
import { pipe } from 'fp-ts/pipeable';
import {
    searchForMavenReleases,
    searchForMavenSnapshots, searchForNpmBetas,
    searchForNpmReleases
} from '../../../common/services/NexusRepoApi';
import NexusSearchResult from '../../../types/NexusSearchResult';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';

const TASK_NAME = 'Get Nexus Project Info';

const createError = (message: string) =>
    new BuildError(message, {
        taskName: TASK_NAME,
        stageName: STAGE_NAME
    });

const updateNexusProjectInfo = (releaseResult: NexusSearchResult, preReleaseResult: NexusSearchResult, projectInfo: ProjectInfo): ProjectInfo => {
    const preReleaseVersion = preReleaseResult.items.length > 0 ? preReleaseResult.items[0].version : undefined;
    const releaseVersion = releaseResult.items.length > 0 ? releaseResult.items[0].version : undefined;
    return {
        ...projectInfo,
        latestNexusVersions: {
            latestPreReleaseVersion: preReleaseVersion,
            latestReleaseVersion: releaseVersion
        }
    };
};


const lookupMavenNexusVersions = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> =>
    pipe(
        searchForMavenReleases(projectInfo.name),
        TE.chain((releaseResult: NexusSearchResult) => pipe(
            searchForMavenSnapshots(projectInfo.name),
            TE.map((snapshotResult: NexusSearchResult) => ([
                releaseResult,
                snapshotResult
            ]))
        )),
        TE.map(([releaseResult, snapshotResult]) =>
            updateNexusProjectInfo(releaseResult, snapshotResult, projectInfo)
        )
    );

const lookupNpmNexusVersions = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> =>
    pipe(
        searchForNpmReleases(projectInfo.name),
        TE.chain((releaseResult: NexusSearchResult) => pipe(
            searchForNpmBetas(projectInfo.name),
            TE.map((betaResult: NexusSearchResult) => ([
                releaseResult,
                betaResult
            ]))
        )),
        TE.map(([releaseResult, betaResult]) =>
            updateNexusProjectInfo(releaseResult, betaResult, projectInfo)
        )
    );

const findNexusVersionInfo = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    switch (context.input.projectType) {
        case ProjectType.MavenLibrary:
        case ProjectType.MavenApplication:
            return lookupMavenNexusVersions(context.input);
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return lookupNpmNexusVersions(context.input);
        default:
            return TE.left(context.createBuildError(`Invalid ProjectType for finding version info: ${context.input.projectType}`));
    }
};

const getNexusProjectInfo: TaskFunction<ProjectInfo, ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        findNexusVersionInfo(context),
        TE.map((projectInfo) => ({
            message: 'Loaded Nexus ProjectInfo successfully',
            value: projectInfo
        }))
    );

export default createTask(STAGE_NAME, TASK_NAME, getNexusProjectInfo);
