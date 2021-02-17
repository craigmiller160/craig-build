import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import { STAGE_NAME } from '../index';

const TASK_NAME = 'Confirm Latest Version';

// TODO figure out types
const confirmLatestVersion: TaskFunction<any> = (context: TaskContext<ProjectInfo>) => {
    return TE.left(new Error('Finish this'));
};

export default createTask(STAGE_NAME, TASK_NAME, confirmLatestVersion);
