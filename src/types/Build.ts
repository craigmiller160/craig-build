import * as E from 'fp-ts/Either';

export type Stage<Input,Result> = (input: Input) => E.Either<Error, Result>;

export type Task<Input,Result> = (input: Input) => E.Either<Error, Result>;
