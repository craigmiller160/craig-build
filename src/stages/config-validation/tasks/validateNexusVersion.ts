import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import ProjectInfo from '../../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import compareVersions from 'compare-versions';
import { STAGE_NAME } from '../index';

export const TASK_NAME = 'Validate Nexus Versions';

const trimVersion = (version: string) =>
    version.split('-')[0];

const validateNexusVersion: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const {
        version,
        isPreRelease
    } = context.input;
    return pipe(
        O.fromNullable(context.input.latestNexusVersions),
        O.fold(
            () => O.of(version),
            (latestNexusVersions) => pipe(
                O.fromNullable(latestNexusVersions.latestReleaseVersion),
                O.filter((latestReleaseVersion) => compareVersions(trimVersion(version), trimVersion(latestReleaseVersion)) === 1),
                O.chainNullableK(() => latestNexusVersions.latestPreReleaseVersion),
                O.filter((latestPreReleaseVersion) => {
                    if (isPreRelease) {
                        return compareVersions(trimVersion(version), trimVersion(latestPreReleaseVersion)) >= 0;
                    }
                    return true;
                })
            )
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