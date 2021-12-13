import spawn from 'cross-spawn';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import getCwd from './getCwd';
import { LOG_PREFIX } from '../common/logger';

export interface Options {
  logOutput?: boolean;
  cwd?: string;
}

const runCommand = (command: string, options?: Options): E.Either<Error, string> => {
  const logOutput = options?.logOutput ?? false;
  const cwd = options?.cwd ?? getCwd();

  console.log(`[${LOG_PREFIX}] [Command]: ${command}`); // eslint-disable-line no-console

  const result = spawn.sync('bash', [ '-c', command ], {
    stdio: logOutput ? 'inherit' : 'pipe',
    cwd
  });
  return pipe(
    O.fromNullable(result.status),
    O.getOrElse(() => -1),
    E.of,
    E.chain<Error, number, string>((status) => {
      if (status === 0) {
        const output = !logOutput ? result.stdout.toString() : 'Output was printed to console';
        return E.right(output);
      }

      if (status === -1) {
        return E.left(new Error('No status code returned from command'));
      }

      const error = !logOutput ? result.stderr.toString() : 'Error was printed to console';
      return E.left(new Error(error));
    })
  );
};

export default runCommand;
