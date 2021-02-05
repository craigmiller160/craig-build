import identifyProject from './tasks/identifyProject';
import getBaseProjectInfo from './tasks/getBaseProjectInfo';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import { SUCCESS_STATUS } from '../../common/logger';
import { isApplication } from '../../utils/projectTypeUtils';
import getKubeProjectInfo from './tasks/getKubeProjectInfo';
import getNexusProjectInfo from './tasks/getNexusProjectInfo';
import createStage, { StageFunction } from '../../common/execution/stage';
import { BuildTask } from '../../common/execution/task';
import { StageContext } from '../../common/execution/context';
import ProjectType from '../../types/ProjectType';

export const STAGE_NAME = 'Identify';

/*
 * 1. Create wrapper object containing
 *      a. Task
 *      b. Should execute rule. Returns undefined if should execute, otherwise returns message to log for skipping
 * 2. Create array of task wrappers.
 * 3. Iterate over this array, probably with a reduce to get a single output
 */

const conditionallyExecuteTask = <Input,ResultValue>(context: StageContext<unknown>, input: Input, task: BuildTask<Input, ResultValue>): TE.TaskEither<Error, ResultValue> => {
    const shouldExecuteResult = task.shouldExecute(input);
    if (shouldExecuteResult) {
        context.logger(`Skipping task ${task.taskName}: ${shouldExecuteResult}`);
        // return TE.right(input); // TODO how to handle output value.
        return TE.left(new Error());
    } else {
        return task.operation(input);
    }
}

const newIdentify: StageFunction<undefined, ProjectType> = (context: StageContext<undefined>) =>
    pipe(
        TE.of<Error,BuildTask<undefined, ProjectType>>(identifyProject),
        TE.chain((identifyProjectTask) => conditionallyExecuteTask(context, undefined, identifyProjectTask)),
        TE.map((value) => ({
            message: '',
            value
        }))
    );

const identify: StageFunction<undefined,ProjectInfo> = () =>
    pipe(
        identifyProject(undefined), // TODO is there some more graceful way to deal with this?
        TE.chain(getBaseProjectInfo),
        TE.chain((projectInfo) => {
            if (isApplication(projectInfo.projectType)) {
                return getKubeProjectInfo(projectInfo);
            }
            return TE.right(projectInfo);
        }),
        TE.chain(getNexusProjectInfo),
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            stageLogger(STAGE_NAME, `Finished successfully. Project Info: ${projectInfoString}`, SUCCESS_STATUS);
            return {
                message: `Project information successfully identified: ${projectInfoString}`,
                value: projectInfo
            }
        })
    );

export default createStage(STAGE_NAME, identify);
