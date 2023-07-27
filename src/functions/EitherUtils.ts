import { either } from 'fp-ts';
import { match } from 'ts-pattern';

export const getOrThrow = <T>(either: either.Either<Error, T>): T =>
	match<either.Either<Error, T>>(either)
		.when(either.isRight, (_) => _.right as T)
		.when(either.isLeft, (_) => {
			throw _.left;
		})
		.run();
