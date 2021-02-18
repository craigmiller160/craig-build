import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import createTask, { TaskFunction } from '../execution/task';
import { TaskContext } from '../execution/context';
import ProjectInfo, { NexusVersions } from '../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import semver from 'semver';
import { STAGE_NAME } from '../../stages/config-validation';
import { executeIfNotDeployOnlyBuild } from '../execution/commonTaskConditions';

export const TASK_NAME = 'Validate Nexus Versions';

const trimVersion = (version: string) =>
    version.split('-')[0];

const compareReleaseVersion = (latestNexusVersions: NexusVersions, version: string): O.Option<string> =>
    pipe(
        O.fromNullable(latestNexusVersions.latestReleaseVersion),
        O.fold(
            () => O.of('0.0.0'),
            (latestReleaseVersion) => O.of(latestReleaseVersion)
        ),
        O.filter((latestReleaseVersion) => semver.compare(trimVersion(version), trimVersion(latestReleaseVersion)) === 1)
    );

const comparePreReleaseVersion = (latestNexusVersions: NexusVersions, version: string, isPreRelease: boolean): O.Option<string> =>
    pipe(
        O.fromNullable(latestNexusVersions.latestPreReleaseVersion),
        O.fold(
            () => O.of('0.0.0'),
            (latestReleaseVersion) => O.of(latestReleaseVersion)
        ),
        O.filter((latestPreReleaseVersion) => {
            if (isPreRelease) {
                return semver.compare(trimVersion(version), trimVersion(latestPreReleaseVersion)) >= 0;
            }
            return true;
        })
    );

const compareNexusVersions = (latestNexusVersions: NexusVersions, version: string, isPreRelease: boolean): O.Option<string> =>
    pipe(
        compareReleaseVersion(latestNexusVersions, version),
        O.chain(() => comparePreReleaseVersion(latestNexusVersions,version, isPreRelease))
    );

const validateNexusVersion: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const {
        version,
        isPreRelease,
        latestNexusVersions
    } = context.input;
    return pipe(
        O.fromNullable(latestNexusVersions),
        O.fold(
            () => O.of(version),
            (latestNexusVersionsVal) => compareNexusVersions(latestNexusVersionsVal, version, isPreRelease)
        ),
        TE.fromOption(() =>
            context.createBuildError('Project version is not higher than versions in Nexus')
        ),
        TE.map(() => ({
            message: 'Successfully validated Nexus versions',
            value: context.input
        }))
    );
};

// TODO fix the stage name here for the common task

export default createTask(STAGE_NAME, TASK_NAME, validateNexusVersion, executeIfNotDeployOnlyBuild);