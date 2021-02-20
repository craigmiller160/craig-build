import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { executeIfNpmProject } from '../../../common/execution/commonTaskConditions';
import runCommand from '../../../utils/runCommand';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import stageName from '../stageName';

export const TASK_NAME = 'Publish';

export const NPM_PUBLISH_COMMAND = 'yarn publish --no-git-tag-version --new-version';
export const CLEAR_GIT_COMMAND = 'git reset HEAD && git checkout .';

const publish: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        runCommand(`${NPM_PUBLISH_COMMAND} ${context.input.version}`, { logOutput: true }),
        E.chain(() => runCommand(CLEAR_GIT_COMMAND)),
        TE.fromEither,
        TE.map(() => ({
            message: 'Published artifact',
            value: context.input
        }))
    );

export default createTask(stageName, TASK_NAME, publish, executeIfNpmProject);
