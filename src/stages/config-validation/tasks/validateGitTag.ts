import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import ProjectInfo from '../../../types/ProjectInfo';
import runCommand from '../../../utils/runCommand';
import { pipe } from 'fp-ts/function';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import { executeIfRelease } from '../../../common/execution/commonTaskConditions';
import stageName from '../stageName';

export const TASK_NAME = 'Validate Git Tags';

const validateGitTag: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        runCommand('git tag'),
        E.chain((output: string) =>
            pipe(
                A.array.filter(output.split('\n'), (tag) => tag.trim() === `v${context.input.version}`),
                A.reduce(E.right('Git tags validated'), (acc, value: string) => {
                    if (E.isLeft(acc)) {
                        return acc;
                    }

                    return E.left(context.createBuildError('Project version git tag already exists'));
                })
            )
        ),
        E.map((message) => ({
            message,
            value: context.input
        })),
        TE.fromEither
    );

export default createTask(stageName, TASK_NAME, validateGitTag, [executeIfRelease]);
