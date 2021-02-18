import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import { executeIfNpmPreRelease } from '../../../common/execution/commonTaskConditions';
import runCommand from '../../../utils/runCommand';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import stageName from '../stageName';

export const TASK_NAME = 'Commit Npm Version Changes';

export const RESET_GIT_STAGING = 'git reset HEAD';
export const ADD_PACKAGE_JSON_IF_CHANGED = 'git status --porcelain | grep package.json | sed \'s/^ M //g\' | xargs git add';
export const CHECK_IF_PACKAGE_JSON_CHANGED = 'git status --porcelain | grep -i \'^M\'';
export const GIT_COMMIT = 'git commit -m "Committing Npm beta version change."';
export const GIT_PUSH = 'git push';

const commitNpmVersionChanges: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        runCommand(RESET_GIT_STAGING),
        E.chain(() => runCommand(ADD_PACKAGE_JSON_IF_CHANGED)),
        E.chain(() => runCommand(CHECK_IF_PACKAGE_JSON_CHANGED)),
        E.chain((output: string) => {
            if (output.length > 0) {
                context.logger('Package.json was changed during publish, committing changes');
                return pipe(
                    runCommand(GIT_COMMIT, { logOutput: true }),
                    E.chain(() => runCommand(GIT_PUSH, { logOutput: true }))
                );
            }
            context.logger('Package.json was not changed during publish');
            return E.right(output);
        }),
        TE.fromEither,
        TE.map(() => ({
            message: 'Completed Npm version changes check',
            value: context.input
        }))
    );

export default createTask(stageName, TASK_NAME, commitNpmVersionChanges, executeIfNpmPreRelease);
