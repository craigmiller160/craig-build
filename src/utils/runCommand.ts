import spawn from 'cross-spawn';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import getCwd from './getCwd';
import { LOG_PREFIX } from '../common/logger';

export interface Options {
  logOutput?: boolean;
  cwd?: string;
}

const runCommand = (command: string, options?: Options): E.Either<Error, string> => {
  const logOutput = options?.logOutput ?? false;
  const cwd = options?.cwd ?? getCwd();

  console.log(`[${LOG_PREFIX}] [Command]: ${command}`);

  const commandParts = command.split(' ');
  const result = spawn.sync(commandParts[0], commandParts.slice(1), {
    cwd
  });
  return pipe(
    O.fromNullable(result.status),
    O.getOrElse(() => -1),
    E.of,
    E.chain<Error, number, string>((status) => {
      if (status === 0) {
        const output = result.stdout.toString();
        if (logOutput) {
          console.log(output); // eslint-disable-line no-console
        }
        return E.right(output);
      }

      if (status === -1) {
        return E.left(new Error('No status code returned from command'));
      }

      const error = result.stderr.toString();
      if (logOutput) {
        console.error(error);
      }
      return E.left(new Error(error));
    })
  );
};

export default runCommand;
