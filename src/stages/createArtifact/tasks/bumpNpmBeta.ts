import ProjectInfo from '../../../types/ProjectInfo';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
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

const whichVersionToBump = (context: TaskContext<ProjectInfo>, nexusVersion: string): E.Either<Error,string> => {
    const comparison = semver.compare(trimVersion(context.input.version), trimVersion(nexusVersion));
    if (comparison === 1) {
        return E.right(context.input.version);
    } else if (comparison === -1) {
        return E.left(context.createBuildError(`Nexus beta version cannot be higher than project version. Project: ${context.input.version} Nexus: ${nexusVersion}`));
    }
    return E.right(nexusVersion);
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

    return pipe(
        whichVersionToBump(context, nexusVersion),
        E.map(bumpVersion),
        E.map((newVersion): ProjectInfo => ({
            ...context.input,
            version: newVersion
        })),
        TE.fromEither,
        TE.map((newProjectInfo: ProjectInfo) => ({
            message: `Bumped Npm project beta version: ${newProjectInfo.version}`,
            value: newProjectInfo
        }))
    );
};

export default createTask(stageName, TASK_NAME, bumpNpmBeta, [
    executeIfNpmProject,
    executeIfPreRelease
]);
