import { option } from 'fp-ts';
import { match } from 'ts-pattern';

export const getOrNull = <T>(option: O.Option<T>): T | null =>
	match<O.Option<T>>(option)
		.when(O.isSome, (_) => _.value as T)
		.when(O.isNone, () => null)
		.run();
