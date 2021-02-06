import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import ProjectInfo from '../../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import compareVersions from 'compare-versions';
import { STAGE_NAME } from '../index';

export const TASK_NAME = 'Validate Nexus Versions';

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
                // TODO if pre-release, then care about latest beta. on release, ignore betas.
                O.fromNullable(latestNexusVersions.latestReleaseVersion),
                O.filter((latestReleaseVersion) => compareVersions(version, latestReleaseVersion) === 1),
                O.chainNullableK(() => latestNexusVersions.latestPreReleaseVersion),
                O.filter((latestPreReleaseVersion) => compareVersions(version, latestPreReleaseVersion) >= 0)
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