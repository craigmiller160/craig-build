import { TaskContext } from './context';
import * as TE from 'fp-ts/TaskEither';
import { Result } from './result';
import { createBuildError } from '../../error/BuildError';
import { taskLogger } from '../logger';
import { pipe } from 'fp-ts/pipeable';

export type TaskFunction<Input,ResultValue> = (context: TaskContext<Input>) => TE.TaskEither<Error, Result<ResultValue>>;

const createTask = <Input, ResultValue>(stageName: string, taskName: string, taskFn: TaskFunction<Input, ResultValue>) => (input: Input): TE.TaskEither<Error, ResultValue> => {
    const taskContext: TaskContext<Input> = {
        stageName,
        taskName,
        createBuildError: createBuildError(stageName, taskName),
        input
    };

    taskLogger(stageName, taskName, 'Starting...');

    return pipe(
        taskFn(taskContext),
        TE.map((result) => {
            taskLogger(stageName, taskName, `Finished. ${result.message}`);
            return result.value;
        })
    );
};

export default createTask;
