import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { STAGE_NAME } from '../index';
import { executeIfNpmProject } from '../../../common/execution/commonTaskConditions';
import runCommand from '../../../utils/runCommand';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';

export const TASK_NAME = 'Publish';

export const NPM_PUBLISH_COMMAND = 'yarn publish --no-git-tag-version --new-version';

const publish: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        runCommand(`${NPM_PUBLISH_COMMAND} ${context.input.version}`, { logOutput: true }),
        TE.fromEither,
        TE.map(() => ({
            message: 'Published artifact',
            value: context.input
        }))
    );

export default createTask(STAGE_NAME, TASK_NAME, publish, executeIfNpmProject);
