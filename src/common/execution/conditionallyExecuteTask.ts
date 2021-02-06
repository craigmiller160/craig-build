import { StageContext } from './context';
import { BuildTask } from './task';
import * as TE from 'fp-ts/TaskEither';

// TODO write tests for this and all the common/execution stuff
const conditionallyExecuteTask = <Input,ResultValue>(context: StageContext<unknown>, input: Input, task: BuildTask<Input, ResultValue>): TE.TaskEither<Error, ResultValue> => {
    console.log(task.shouldExecute); // TODO delete this
    const shouldExecuteResult = task.shouldExecute(input);
    if (shouldExecuteResult) {
        context.logger(`Skipping task ${task.taskName}: ${shouldExecuteResult}`);
        return TE.right(task.getDefaultResult(input));
    } else {
        return task.operation(input);
    }
};

export default conditionallyExecuteTask;