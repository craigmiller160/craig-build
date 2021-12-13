import createTask, {TaskFunction, TaskShouldExecuteFunction} from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import {TaskContext} from '../../../common/execution/context';
import stageName from '../stageName';
import {executeIfPreRelease} from '../../../common/execution/commonTaskConditions';
import {isApplication, isDocker} from '../../../utils/projectTypeUtils';

export const TASK_NAME = 'Bump Docker Beta';

const bumpDockerBeta: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    // 1) Handle Maven & NPM, they're easy
    // 2) Figure out how to handle Docker
};

const shouldExecute: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (isDocker(input.projectType) || isApplication(input.projectType)) {
        return undefined;
    }

    return {
        message: 'Is not application or a Docker project',
        defaultResult: input
    };
};

export default createTask(stageName, TASK_NAME, bumpDockerBeta, [
    shouldExecute,
    executeIfPreRelease
]);