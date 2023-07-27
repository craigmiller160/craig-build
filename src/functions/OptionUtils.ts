import { option } from 'fp-ts';
import { match } from 'ts-pattern';

export const getOrNull = <T>(optionValue: option.Option<T>): T | null =>
	match<option.Option<T>>(optionValue)
		.when(option.isSome, (_) => _.value as T)
		.when(option.isNone, () => null)
		.run();
