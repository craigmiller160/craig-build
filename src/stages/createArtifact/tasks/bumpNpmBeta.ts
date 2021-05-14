import ProjectInfo from '../../../types/ProjectInfo';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { executeIfNpmProject, executeIfPreRelease } from '../../../common/execution/commonTaskConditions';
import stageName from '../stageName';
import { pipe } from 'fp-ts/pipeable';
import semver from 'semver';

export const TASK_NAME = 'Bump Npm Beta';

const trimVersion = (version: string) =>
    version.split('-')[0];

const separateBetaNumber = (version: string): [string, number] => {
    const [versionNumber, betaPart] = version.split('-');
    const [beta, betaNumber] = betaPart.split('.');
    return [`${versionNumber}-${beta}`, parseInt(betaNumber ?? 0)];
};

const bumpVersion = (version: string) => {
    const [versionWithoutBetaNum, betaNumber] = separateBetaNumber(version);
    const newBetaNumber = betaNumber + 1;
    return `${versionWithoutBetaNum}.${newBetaNumber}`;
};

const whichVersionToBump = (projectVersion: string, nexusVersion: string): string => {
    if (semver.compare(trimVersion(projectVersion), trimVersion(nexusVersion)) === 1) {
        return projectVersion;
    }
    return nexusVersion;
};

const bumpNpmBeta: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const nexusVersion = pipe(
        O.fromNullable(context.input.latestNexusVersions),
        O.chain((latestNexusVersions) => O.fromNullable(latestNexusVersions.latestPreReleaseVersion)),
        O.fold(
            () => context.input.version,
            (version) => version
        )
    );
    const versionToBump = whichVersionToBump(context.input.version, nexusVersion);
    const newVersion = bumpVersion(versionToBump);
    const newProjectInfo: ProjectInfo = {
        ...context.input,
        version: newVersion
    };

    return TE.right({
        message: `Bumped Npm project beta version: ${newVersion}`,
        value: newProjectInfo
    });
};

export default createTask(stageName, TASK_NAME, bumpNpmBeta, [
    executeIfNpmProject,
    executeIfPreRelease
]);
