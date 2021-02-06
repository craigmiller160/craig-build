import { TaskContext } from './context';
import * as TE from 'fp-ts/TaskEither';
import { Result } from './result';
import { createBuildError } from '../../error/BuildError';
import { createTaskLogger, SUCCESS_STATUS } from '../logger';
import { pipe } from 'fp-ts/pipeable';

// TODO when input and output are the same, don't need to put it in twice. Apply this to all types here and all their uses in the app

export interface TaskSkipExecutionResult<ResultValue> {
    message: string;
    defaultResult: ResultValue;
}

export type TaskFunction<Input,ResultValue> = (context: TaskContext<Input>) => TE.TaskEither<Error, Result<ResultValue>>;
export type TaskOperation<Input,ResultValue> = (input: Input) => TE.TaskEither<Error, ResultValue>;
export type TaskShouldExecuteFunction<Input,ResultValue> = (input: Input) =>  TaskSkipExecutionResult<ResultValue> | undefined;
export interface BuildTask<Input,ResultValue> {
    stageName: string;
    taskName: string;
    operation: TaskOperation<Input, ResultValue>;
    shouldExecute: TaskShouldExecuteFunction<Input, ResultValue>;
}

const defaultShouldExecute: TaskShouldExecuteFunction<any,any> = (input: any) => undefined;

// TODO the should execute function should return either undefined or an object with a message and default value

const createTask = <Input, ResultValue>(
    stageName: string,
    taskName: string,
    taskFn: TaskFunction<Input, ResultValue>,
    shouldExecuteFn?: TaskShouldExecuteFunction<Input,ResultValue>): BuildTask<Input,ResultValue> => {
    return {
        stageName,
        taskName,
        shouldExecute: (input: Input): TaskSkipExecutionResult<ResultValue> | undefined => {
            return shouldExecuteFn ? shouldExecuteFn(input) : defaultShouldExecute(input);
        },
        operation: (input: Input): TE.TaskEither<Error, ResultValue> => {
            const taskContext: TaskContext<Input> = {
                stageName,
                taskName,
                createBuildError: createBuildError(stageName, taskName),
                input,
                logger: createTaskLogger(stageName, taskName)
            };

            taskContext.logger('Starting...');

            return pipe(
                taskFn(taskContext),
                TE.map((result) => {
                    taskContext.logger(`Finished. ${result.message}`, SUCCESS_STATUS);
                    return result.value;
                })
            );
        }
    };
};
export type TaskCreator = typeof createTask;
export default createTask;
