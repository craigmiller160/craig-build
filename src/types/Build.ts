import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

type BuildStep<Result> = () => E.Either<Error, Result>;
type AsyncBuildStep<Result> = () => TE.TaskEither<Error, Result>;
type InputBuildStep<Input, Result> = (input: Input) => E.Either<Error, Result>;
type AsyncInputBuildStep<Input,Result> = (input: Input) => TE.TaskEither<Error, Result>

export type Stage<Result> = BuildStep<Result>;
export type AsyncStage<Result> = AsyncBuildStep<Result>;
export type InputStage<Input, Result> = InputBuildStep<Input, Result>;
export type AsyncInputStage<Input, Result> = AsyncInputBuildStep<Input, Result>;

export type Task<Result> = BuildStep<Result>;
export type AsyncTask<Result> = AsyncBuildStep<Result>;
export type InputTask<Input, Result> = InputBuildStep<Input, Result>;
export type AsyncInputTask<Input, Result> = AsyncInputBuildStep<Input, Result>;

export interface BuildContext {
    stageName?: string;
    taskName?: string;
}
