import identify from './stages/identify';
import { buildLogger } from './context/logger';
import getCwd from './utils/getCwd';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';

const execute = (): E.Either<Error, any> => { // TODO improve type here
    buildLogger(`Starting build for: ${getCwd()}`);

    return pipe(
        identify(),
        E.map(() => {
            // TODO include more details on output
            buildLogger('Build finished successfully');
        })
    );
};

export default execute;
