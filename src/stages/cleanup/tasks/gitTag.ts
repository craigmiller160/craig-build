import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { STAGE_NAME } from '../index';
import { executeIfRelease } from '../../../common/execution/commonTaskConditions';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import runCommand from '../../../utils/runCommand';

export const TASK_NAME = 'Git Tag';

const createGitTag = (version: string) =>
    `git tag v${version}`;

const PUSH_TAG = 'git push --tags';

const gitTag: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        runCommand(createGitTag(context.input.version)),
        E.chain(() => runCommand(PUSH_TAG)),
        TE.fromEither,
        TE.map(() => ({
            message: `Created Git version tag`,
            value: context.input
        }))
    );

export default createTask(STAGE_NAME, TASK_NAME, gitTag, executeIfRelease);
