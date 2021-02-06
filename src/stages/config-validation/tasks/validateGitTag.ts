import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import ProjectInfo from '../../../types/ProjectInfo';
import { STAGE_NAME } from '../index';
import runCommand from '../../../utils/runCommand';
import { pipe } from 'fp-ts/pipeable';
import createTask, { TaskFunction, TaskShouldExecuteFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';

export const TASK_NAME = 'Validate Git Tags';

const validateGitTag: TaskFunction<ProjectInfo,ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
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

const shouldExecute: TaskShouldExecuteFunction<ProjectInfo, ProjectInfo> = (projectInfo: ProjectInfo) => {
    if (!projectInfo.isPreRelease) {
        return undefined;
    }

    return {
        message: 'Project is not release version',
        defaultResult: projectInfo
    };
};

export default createTask(STAGE_NAME, TASK_NAME, validateGitTag, shouldExecute);
