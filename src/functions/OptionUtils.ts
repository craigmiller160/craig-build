import * as O from 'fp-ts/Option';
import { match, when } from 'ts-pattern';

export const getOrNull = <T>(option: O.Option<T>): T | null =>
	match<O.Option<T>>(option)
		.with(when(O.isSome), (_) => _.value)
		.with(when(O.isNone), () => null)
		.run();
