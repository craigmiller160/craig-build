import spawn from 'cross-spawn';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';

const runCommand = (command: string, logOutput: boolean = false): E.Either<Error, string> => {
  const commandParts = command.split(' ');
  const result = spawn.sync(commandParts[0], commandParts.slice(1));
  return pipe(
    O.fromNullable(result.status),
    O.getOrElse(() => -1),
    E.of,
    E.chain<Error, number, string>((status) => {
      if (status === 0) {
          const output = result.stdout.toString();
          if (logOutput) {
              console.log(output);
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
