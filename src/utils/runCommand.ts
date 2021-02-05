import spawn from 'cross-spawn';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';

const runCommand = (command: string): E.Either<Error, string> => {
    const commandParts = command.split(' ');
    const result = spawn.sync(commandParts[0], commandParts.slice(1));
    return pipe(
        O.fromNullable(result.status),
        O.getOrElse(() => -1),
        E.of,
        E.chain<Error,number,string>((status) => {
            if (status === 0) {
                return E.right(result.stdout.toString());
            }

            if (status === -1) {
                return E.left(new Error('No status code returned from command'));
            }

            return E.left(new Error(result.stderr.toString()));
        })
    );
};

export default runCommand;
