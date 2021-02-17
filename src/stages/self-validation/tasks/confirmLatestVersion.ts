import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import { STAGE_NAME } from '../index';

const TASK_NAME = 'Confirm Latest Version';

/*
 * What are the rules here?
 *
 * 1) If release version, then it must be >= nexus release version
 * 2) If beta version, then it must be >= highest beta version and > highest release version
 */

// TODO figure out types
const confirmLatestVersion: TaskFunction<any> = (context: TaskContext<ProjectInfo>) => {
    return TE.left(new Error('Finish this'));
};

export default createTask(STAGE_NAME, TASK_NAME, confirmLatestVersion);
