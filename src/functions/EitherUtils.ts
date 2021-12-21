import * as E from 'fp-ts/Either';
import { match, when } from 'ts-pattern';

export const getOrThrow = <T>(either: E.Either<Error, T>): T =>
	match<E.Either<Error, T>>(either)
		.with(when(E.isRight), (_) => _.right)
		.with(when(E.isLeft), (_) => {
			throw _.left;
		})
		.exhaustive();
