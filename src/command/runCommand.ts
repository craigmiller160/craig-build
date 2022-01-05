import spawn from 'cross-spawn';
import * as TE from 'fp-ts/TaskEither';
import { getCwd } from './getCwd';
import { match } from 'ts-pattern';
import { unknownToError } from '../functions/unknownToError';
import { logger } from '../logger';

type Variables = { [key: string]: string };

export interface CommandOptions {
	readonly printOutput: boolean;
	readonly cwd: string;
	readonly variables: Variables;
}

const formatCommand = (command: string, variables: Variables): string =>
	Object.entries(variables).reduce(
		(newCmd, [key, value]) => newCmd.replaceAll(`\${${key}}`, value),
		command
	);

export const runCommand = (
	command: string,
	options?: Partial<CommandOptions>
): TE.TaskEither<Error, string> => {
	const printOutput = options?.printOutput ?? false;
	const cwd = options?.cwd ?? getCwd();
	const variables = options?.variables ?? {};

	logger.debug(`Command: ${command}`);
	const formattedCommand = formatCommand(command, variables);

	return TE.tryCatch(
		() =>
			new Promise((resolve, reject) => {
				const childProcess = spawn('bash', ['-c', formattedCommand], {
					cwd
				});
				let fullOutput = '';
				childProcess.stdout?.on('data', (data) => {
					fullOutput += data;
					if (printOutput) {
						process.stdout.write(data);
					}
				});
				childProcess.stderr?.on('data', (data) => {
					fullOutput += data;
					if (printOutput) {
						process.stderr.write(data);
					}
				});
				childProcess.on('close', (code) => {
					match(code)
						.with(0, () => resolve(fullOutput))
						.otherwise(() => reject(fullOutput));
				});
			}),
		unknownToError
	);
};
