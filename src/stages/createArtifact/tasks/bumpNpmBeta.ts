import ProjectInfo from '../../../types/ProjectInfo';
import { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';

const separateBetaNumber = (version: string): [string, number] => {
    const [versionNumber, betaPart] = version.split('-');
    const [beta, betaNumber] = betaPart.split('.'); // TODO what if there is no beta number yet?
    return [`${versionNumber}-${beta}`, parseInt(betaNumber)];
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

export default {};
