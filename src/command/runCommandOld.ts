import spawn from 'cross-spawn';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { getCwd } from './getCwd';
import { logger } from '../logger';
import { match, when } from 'ts-pattern';
import { SpawnSyncReturns } from 'child_process';

// TODO delete all of this

// TODO add environment variable support
export interface CommandOptions {
    readonly printOutput: boolean;
    readonly cwd: string;
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

const handleSuccess = (
    result: SpawnSyncReturns<Buffer>,
    printOutput: boolean
) => {
    const output = result.stdout.toString();
    if (printOutput) {
        console.log(output); // eslint-disable-line no-console
    }
    return E.right(output);
};

const handleFailure = (
    result: SpawnSyncReturns<Buffer>,
    printOutput: boolean
) => {
    const output = result.stderr.toString();
    if (printOutput) {
        console.log(output); // eslint-disable-line no-console
    }
    return E.left(new Error(output));
};

const handleNoStatus = (): E.Either<Error, string> =>
    E.left(new Error('No status code returned from command'));

export const runCommand = (
    command: string,
    options?: Partial<CommandOptions>
): E.Either<Error, string> => {
    logger.debug(`Running Command: [${command}]`);
    const { printOutput, cwd } = getCommandOptions(options);

    const result = spawn.sync('bash', ['-c', command], {
        stdio: 'pipe',
        cwd
    });

    const status = pipe(
        O.fromNullable(result.status),
        O.getOrElse(() => -1)
    );

    return match(status)
        .with(
            when<number>((_) => _ === 0),
            () => handleSuccess(result, printOutput)
        )
        .with(
            when<number>((_) => _ === -1),
            handleNoStatus
        )
        .otherwise(() => handleFailure(result, printOutput));
};
