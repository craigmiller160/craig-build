import { option } from 'fp-ts';
import { match } from 'ts-pattern';

export const getOrNull = <T>(option: option.Option<T>): T | null =>
	match<option.Option<T>>(option)
		.when(option.isSome, (_) => _.value as T)
		.when(option.isNone, () => null)
		.run();
