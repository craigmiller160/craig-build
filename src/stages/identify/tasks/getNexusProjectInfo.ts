import { InputTask } from '../../../types/Build';
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

const TASK_NAME = 'Get Nexus Project Info';

const updateNexusProjectInfo = (releaseResult: NexusSearchResult, preReleaseResult: NexusSearchResult, projectInfo: ProjectInfo): ProjectInfo => {
    const preReleaseVersion = preReleaseResult.items.length > 0 ? preReleaseResult.items[0].version ? undefined;
    const releaseVersion = releaseResult.items.length > 0 ? releaseResult.items[0].version ? undefined;
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

const findNexusVersionInfo = (projectInfo: ProjectInfo): TE.TaskEither<Error, ProjectInfo> => {
    switch (projectInfo.projectType) {
        case ProjectType.MavenLibrary:
        case ProjectType.MavenApplication:
            return lookupMavenNexusVersions(projectInfo);
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return lookupNpmNexusVersions(projectInfo);
        default:
            return TE.left(new BuildError(`Invalid ProjectType for finding version info: ${projectInfo.projectType}`, { taskName: TASK_NAME }));
    }
};

const getNexusProjectInfo: InputTask<ProjectInfo, ProjectInfo> = async (projectInfo: ProjectInfo) => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    return pipe(
        await findNexusVersionInfo(projectInfo)(),
        E.map((projectInfo) => {
            taskLogger(STAGE_NAME, TASK_NAME, 'Finished loading Nexus ProjectInfo successfully', SUCCESS_STATUS);
            return projectInfo;
        })
    );
};

export default getNexusProjectInfo;