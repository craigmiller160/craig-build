import ProjectInfo from '../../../types/ProjectInfo';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import { STAGE_NAME } from '../index';
import { executeIfNpmPreRelease } from '../../../common/execution/commonTaskConditions';

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

export default createTask(STAGE_NAME, TASK_NAME, bumpNpmBeta, executeIfNpmPreRelease);