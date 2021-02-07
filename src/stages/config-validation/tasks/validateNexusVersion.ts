import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import ProjectInfo, { NexusVersions } from '../../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import compareVersions from 'compare-versions';
import { STAGE_NAME } from '../index';

export const TASK_NAME = 'Validate Nexus Versions';

const trimVersion = (version: string) =>
    version.split('-')[0];

const compareReleaseVersion = (latestNexusVersions: NexusVersions, version: string): O.Option<string> =>
    pipe(
        O.fromNullable(latestNexusVersions.latestReleaseVersion),
        O.filter((latestReleaseVersion) => compareVersions(trimVersion(version), trimVersion(latestReleaseVersion)) === 1)
    );

const comparePreReleaseVersion = (latestNexusVersions: NexusVersions, version: string, isPreRelease: boolean): O.Option<string> =>
    pipe(
        O.fromNullable(latestNexusVersions.latestPreReleaseVersion),
        O.filter((latestPreReleaseVersion) => {
            if (isPreRelease) {
                return compareVersions(trimVersion(version), trimVersion(latestPreReleaseVersion)) >= 0;
            }
            return true;
        })
    );

const compareNexusVersions = (latestNexusVersions: NexusVersions, version: string, isPreRelease: boolean): O.Option<string> => {
    if (isPreRelease) {
        return pipe(
            [
                compareReleaseVersion(latestNexusVersions, version),
                comparePreReleaseVersion(latestNexusVersions, version, isPreRelease)
            ],
            A.reduce<O.Option<string>,O.Option<string>>(O.none, (acc, option) => {
                if (O.isSome(acc)) {
                    return acc;
                }

                if (O.isSome(option)) {
                    return option;
                }

                return O.none;
            })
        )
    }

    return pipe(
        compareReleaseVersion(latestNexusVersions, version),
        O.chain(() => comparePreReleaseVersion(latestNexusVersions,version, isPreRelease))
    );
};

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

export default createTask(STAGE_NAME, TASK_NAME, validateNexusVersion);