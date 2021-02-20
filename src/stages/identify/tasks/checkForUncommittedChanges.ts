import * as E from 'fp-ts/Either';
import createTask, { TaskFunction } from '../../../common/execution/task';
import stageName from '../stageName';
import { pipe } from 'fp-ts/pipeable';

export const TASK_NAME = 'Check For Uncommitted Changes';
const GIT_COMMAND = 'git status --porcelain';

const checkForUncommittedChanges: TaskFunction<undefined> = (context: TaskFunction<undefined>) =>
    pipe(

    );

export default createTask(stageName, TASK_NAME, checkForUncommittedChanges);