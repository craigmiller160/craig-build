import spawn from 'cross-spawn';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { getCwd } from './getCwd';

export interface CommandOptions {
	printOutput: boolean;
	cwd: string;
}

const getCommandOptions = (options?: Partial<CommandOptions>): CommandOptions =>
	pipe(
		O.fromNullable(options),
		O.map((opts): CommandOptions => {
			const printOutput = pipe(
				O.fromNullable(opts.printOutput),
				O.getOrElse((): boolean => false)
			);
			const cwd = pipe(O.fromNullable(opts.cwd), O.getOrElse(getCwd));
			return {
				printOutput,
				cwd
			};
		}),
		O.getOrElse(
			(): CommandOptions => ({
				printOutput: false,
				cwd: getCwd()
			})
		)
	);

export const runCommand = (
	command: string,
	options?: Partial<CommandOptions>
): E.Either<Error, string> => {
	const { printOutput, cwd } = getCommandOptions(options);

	const result = spawn.sync('bash', ['-c', command], {
		stdio: 'inherit',
		cwd
	});
};
