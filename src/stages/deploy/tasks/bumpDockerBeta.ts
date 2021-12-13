import createTask, {TaskFunction} from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import {TaskContext} from '../../../common/execution/context';
import stageName from '../stageName';
import {executeIfPreRelease} from '../../../common/execution/commonTaskConditions';

export const TASK_NAME = 'Bump Docker Beta';

const bumpDockerBeta: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {

};

export default createTask(stageName, TASK_NAME, bumpDockerBeta, [
    executeIfPreRelease
]);