import { option } from 'fp-ts';
import { function as func } from 'fp-ts';

export const regexTest =
	(regex: RegExp) =>
	(value: string): boolean =>
		regex.test(value);

export const regexExecGroups =
	<Groups extends object>(regex: RegExp) =>
	(value: string): option.Option<Groups> =>
		func.pipe(
			option.fromNullable(regex.exec(value)),
			option.chain((_) => option.fromNullable(_.groups)),
			option.map((_) => _ as Groups)
		);
