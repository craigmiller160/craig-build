import * as E from 'fp-ts/Either';

type BuildStep<Result> = () => E.Either<Error, Result>;
type InputBuildStep<Input, Result> = (input: Input) => E.Either<Error, Result>;

export type Stage<Result> = BuildStep<Result>;
export type InputStage<Input, Result> = InputBuildStep<Input, Result>;
export type Task<Result> = BuildStep<Result>;
export type InputTask<Input, Result> = InputBuildStep<Input, Result>;
