import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

export const regexTest =
	(regex: RegExp) =>
	(value: string): boolean =>
		regex.test(value);

export const regexExecGroups =
	<Groups extends object>(regex: RegExp) =>
	(value: string): O.Option<Groups> =>
		pipe(
			O.fromNullable(regex.exec(value)),
			O.chain((_) => O.fromNullable(_.groups)),
			O.map((_) => _ as Groups)
		);
