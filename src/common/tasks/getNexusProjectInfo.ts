import ProjectInfo from '../../types/ProjectInfo';
import * as TE from 'fp-ts/TaskEither';
import ProjectType from '../../types/ProjectType';
import { pipe } from 'fp-ts/pipeable';
import {
    searchForMavenReleases,
    searchForMavenSnapshots,
    searchForNpmBetas,
    searchForNpmReleases
} from '../services/NexusRepoApi';
import NexusSearchResult from '../../types/NexusSearchResult';
import createTask, { TaskFunction } from '../execution/task';
import { TaskContext } from '../execution/context';

const TASK_NAME = 'Get Nexus Project Info';

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

const getNexusProjectInfo: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        findNexusVersionInfo(context),
        TE.map((projectInfo) => ({
            message: 'Loaded Nexus ProjectInfo successfully',
            value: projectInfo
        }))
    );

export default (stageName: string) => createTask(stageName, TASK_NAME, getNexusProjectInfo);