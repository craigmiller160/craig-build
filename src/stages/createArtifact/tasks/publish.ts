import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { executeIfNpmProject } from '../../../common/execution/commonTaskConditions';
import runCommand from '../../../utils/runCommand';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import stageName from '../stageName';
import simpleGit from 'simple-git';
import handleUnknownError from '../../../utils/handleUnknownError';
import getCwd from '../../../utils/getCwd';

export const TASK_NAME = 'Publish';

export const NPM_PUBLISH_COMMAND = 'yarn publish --no-git-tag-version --new-version';

// TODO update tests to mock the command
const publish: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    const git = simpleGit({
        baseDir: getCwd()
    });

    return pipe(
        runCommand(`${NPM_PUBLISH_COMMAND} ${context.input.version}`, { logOutput: true }),
        TE.fromEither,
        TE.chain(() => TE.tryCatch(
            () => git.checkout('.'),
            handleUnknownError
        )),
        TE.map(() => ({
            message: 'Published artifact',
            value: context.input
        }))
    );
};

export default createTask(stageName, TASK_NAME, publish, executeIfNpmProject);
