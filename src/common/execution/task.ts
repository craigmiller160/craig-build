import { TaskContext } from './context';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
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
export type TaskShouldExecuteFunction<Input,ResultValue> = (input: Input) =>  TaskSkipExecutionResult<ResultValue> | undefined;
export type BuildTask<Input,ResultValue> = (input: Input) => TE.TaskEither<Error, ResultValue>;

const defaultShouldExecute: TaskShouldExecuteFunction<any,any> = (input: any) => undefined;

const createTask = <Input, ResultValue>(
    stageName: string,
    taskName: string,
    taskFn: TaskFunction<Input, ResultValue>,
    shouldExecuteFn?: TaskShouldExecuteFunction<Input,ResultValue>): BuildTask<Input,ResultValue> =>
    (input: Input): TE.TaskEither<Error, ResultValue> => {
        const taskContext: TaskContext<Input> = {
            stageName,
            taskName,
            createBuildError: createBuildError(stageName, taskName),
            input,
            logger: createTaskLogger(stageName, taskName)
        };

        return pipe(
            O.fromNullable(shouldExecuteFn),
            O.chainNullableK((fn) => fn(input)),
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
