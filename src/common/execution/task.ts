import { TaskContext } from './context';
import * as TE from 'fp-ts/TaskEither';
import { Result } from './result';
import { createBuildError } from '../../error/BuildError';
import { createTaskLogger, SUCCESS_STATUS } from '../logger';
import { pipe } from 'fp-ts/pipeable';

// TODO when input and output are the same, don't need to put it in twice
export type TaskFunction<Input,ResultValue> = (context: TaskContext<Input>) => TE.TaskEither<Error, Result<ResultValue>>;
export type TaskShouldExecuteFunction<Input> = (input: Input) => string | undefined;
export type TaskGetDefaultResultFunction<Input,ResultValue> = (input: Input) => ResultValue;
export interface BuildTask<Input,ResultValue> {
    stageName: string;
    taskName: string;
    operation: (input: Input) => TE.TaskEither<Error, ResultValue>;
    shouldExecute: (input: Input) => string | undefined;
    getDefaultResult: (input: Input) => ResultValue;
}

const defaultShouldExecute: TaskShouldExecuteFunction<any> = (input: any) => undefined;
const defaultGetDefaultResult: TaskGetDefaultResultFunction<any, any> = (input: any) => null as any;

const createTask = <Input, ResultValue>(
    stageName: string,
    taskName: string,
    taskFn: TaskFunction<Input, ResultValue>,
    shouldExecuteFn?: TaskShouldExecuteFunction<Input>,
    getDefaultResultFn?: TaskGetDefaultResultFunction<Input, ResultValue>): BuildTask<Input,ResultValue> => {
    if (shouldExecuteFn && !getDefaultResultFn) {
        throw new Error('CRITICAL ERROR: if shouldExecute rules are defined for a task, then getDefaultResult needs to be defined as well');
    }

    return {
        stageName,
        taskName,
        shouldExecute: (input: Input) => {
            return shouldExecuteFn ? shouldExecuteFn(input) : defaultShouldExecute(input);
        },
        getDefaultResult: (input: Input) => {
            return getDefaultResultFn ? getDefaultResultFn(input) : defaultGetDefaultResult(input);
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
