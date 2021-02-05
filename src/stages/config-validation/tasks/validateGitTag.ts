import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { InputTask, Task } from '../../../types/Build';
import ProjectInfo from '../../../types/ProjectInfo';
import { SUCCESS_STATUS, taskLogger } from '../../../common/logger';
import { STAGE_NAME } from '../index';
import runCommand from '../../../utils/runCommand';
import { pipe } from 'fp-ts/pipeable';
import { isLeft } from 'fp-ts/Either';
import BuildError from '../../../error/BuildError';

export const TASK_NAME = 'Validate Git Tags';

const createError = (message: string) =>
    new BuildError(message, {
        taskName: TASK_NAME,
        stageName: STAGE_NAME
    });

// TODO make sure all tasks/stages have proper start/finish logging

const validateGitTag: InputTask<ProjectInfo,ProjectInfo> = (projectInfo: ProjectInfo) => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    if (projectInfo.isPreRelease) {
        taskLogger(STAGE_NAME, TASK_NAME, 'Finished. Skipping git tag check for pre-release version.', SUCCESS_STATUS);
        return E.right(projectInfo);
    }

    return pipe(
        runCommand('git tag'),
        E.chain((output: string) =>
            pipe(
                A.array.filter(output.split('\n'), (tag) => tag.trim() === `v${projectInfo.version}`),
                A.reduce(E.right('Git tags validated'), (acc, value: string) => {
                    if (E.isLeft(acc)) {
                        return acc;
                    }

                    return E.left(createError('Project version git tag already exists'));
                })
            )
        ),
        E.map((message: string) => {
            taskLogger(STAGE_NAME, TASK_NAME, `Finished. ${message}`, SUCCESS_STATUS);
            return projectInfo;
        })
    );
};

export default validateGitTag;
