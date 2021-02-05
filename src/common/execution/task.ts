import { TaskContext } from './context';
import * as E from 'fp-ts/Either';
import { Result } from './result';
import { createBuildError } from '../../error/BuildError';
import { taskLogger } from '../logger';
import { pipe } from 'fp-ts/pipeable';

export type TaskFunction = <Input,ResultValue>(context: TaskContext<Input>) => E.Either<Error, Result<ResultValue>>;

const createTask = (stageName: string, taskName: string, taskFn: TaskFunction) => <Input, ResultValue>(input: Input): E.Either<Error, ResultValue> => {
    const taskContext: TaskContext<Input> = {
        stageName,
        taskName,
        createBuildError: createBuildError(stageName, taskName),
        input
    };

    taskLogger(stageName, taskName, 'Starting...');

    return pipe(
        taskFn<Input,ResultValue>(taskContext),
        E.map((result) => {
            taskLogger(stageName, taskName, `Finished. ${result.message}`);
            return result.value;
        })
    );
};

export default createTask;
