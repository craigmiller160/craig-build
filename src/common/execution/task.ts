import { TaskContext } from './context';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { Result } from './result';
import { createBuildError } from '../../error/BuildError';
import { createTaskLogger, SUCCESS_STATUS } from '../logger';
import { pipe } from 'fp-ts/pipeable';

export interface TaskSkipExecutionResult<ResultValue> {
    message: string;
    defaultResult: ResultValue;
}

export type TaskFunction<Input,ResultValue = Input> = (context: TaskContext<Input>) => TE.TaskEither<Error, Result<ResultValue>>;
export type TaskShouldExecuteFunction<Input,ResultValue = Input> = (input: Input) =>  TaskSkipExecutionResult<ResultValue> | undefined;
export type BuildTask<Input,ResultValue = Input> = (input: Input) => TE.TaskEither<Error, ResultValue>;

const defaultShouldExecute: TaskShouldExecuteFunction<any> = (input: any) => undefined;

const createTask = <Input, ResultValue = Input>(
    stageName: string,
    taskName: string,
    taskFn: TaskFunction<Input, ResultValue>,
    shouldExecuteFns: TaskShouldExecuteFunction<Input,ResultValue>[] = []): BuildTask<Input,ResultValue> =>
    (input: Input): TE.TaskEither<Error, ResultValue> => {
        const taskContext: TaskContext<Input> = {
            stageName,
            taskName,
            createBuildError: createBuildError(stageName, taskName),
            input,
            logger: createTaskLogger(stageName, taskName)
        };

        type ReduceType1 = TaskShouldExecuteFunction<Input,ResultValue>;
        type ReduceType2 = TaskSkipExecutionResult<ResultValue> | undefined;

        return pipe(
            shouldExecuteFns,
            A.reduce<ReduceType1,ReduceType2>(undefined, (result, fn) => {
                if (result !== undefined) {
                    return result;
                }
                return fn(input);
            }),
            O.fromNullable,
            O.map((result: TaskSkipExecutionResult<ResultValue>) => {
                taskContext.logger(`Skipping task ${taskName}: ${result.message}`);
                return result.defaultResult;
            }),
            O.fold(
                () => {
                    taskContext.logger('Starting...');
                    return pipe(
                        taskFn(taskContext),
                        TE.map((result) => {
                            taskContext.logger(`Finished. ${result.message}`, SUCCESS_STATUS);
                            return result.value;
                        })
                    );
                },
                (defaultResult) => TE.right(defaultResult)
            )
        );
    };

export type TaskCreator = typeof createTask;
export default createTask;
