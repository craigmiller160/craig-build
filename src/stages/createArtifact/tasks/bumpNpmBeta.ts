import ProjectInfo from '../../../types/ProjectInfo';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import { executeIfNpmPreRelease } from '../../../common/execution/commonTaskConditions';
import stageName from '../stageName';

export const TASK_NAME = 'Bump Npm Beta';

const separateBetaNumber = (version: string): [string, number] => {
    const [versionNumber, betaPart] = version.split('-');
    const [beta, betaNumber] = betaPart.split('.');
    return [`${versionNumber}-${beta}`, parseInt(betaNumber ?? 0)];
};

const bumpNpmBeta: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const [versionWithoutBetaNum, betaNumber] = separateBetaNumber(context.input.version);
    const newBetaNumber = betaNumber + 1;
    const newVersion = `${versionWithoutBetaNum}.${newBetaNumber}`;
    const newProjectInfo: ProjectInfo = {
        ...context.input,
        version: newVersion
    };

    return TE.right({
        message: `Bumped Npm project beta version: ${newVersion}`,
        value: newProjectInfo
    });
};

export default createTask(stageName, TASK_NAME, bumpNpmBeta, executeIfNpmPreRelease);
