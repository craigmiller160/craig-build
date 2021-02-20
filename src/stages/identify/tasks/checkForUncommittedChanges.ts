import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import createTask, { TaskFunction } from '../../../common/execution/task';
import stageName from '../stageName';
import { pipe } from 'fp-ts/pipeable';
import runCommand from '../../../utils/runCommand';
import { TaskContext } from '../../../common/execution/context';

export const TASK_NAME = 'Check For Uncommitted Changes';
const GIT_COMMAND = 'git status --porcelain';

const checkForUncommittedChanges: TaskFunction<undefined> = (context: TaskContext<undefined>) =>
    pipe(
        runCommand(GIT_COMMAND),
        E.chain((result: string) => {
            if (result.length > 0) {
                return E.left(context.createBuildError('Please commit or revert all changes before running build.'));
            }
            return E.right('');
        }),
        TE.fromEither,
        TE.map(() => ({
            message: 'No uncommitted changes found',
            value: undefined
        }))
    );

export default createTask(stageName, TASK_NAME, checkForUncommittedChanges);