import { either } from 'fp-ts';
import { match } from 'ts-pattern';

export const getOrThrow = <T>(eitherValue: either.Either<Error, T>): T =>
	match<either.Either<Error, T>>(eitherValue)
		.when(either.isRight, (_) => _.right as T)
		.when(either.isLeft, (_) => {
			throw _.left;
		})
		.run();
