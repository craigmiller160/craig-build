import { either } from 'fp-ts';
import { match } from 'ts-pattern';

export const getOrThrow = <T>(either: E.Either<Error, T>): T =>
	match<E.Either<Error, T>>(either)
		.when(E.isRight, (_) => _.right as T)
		.when(E.isLeft, (_) => {
			throw _.left;
		})
		.run();
