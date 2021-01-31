import execute from './execution';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';

pipe(
    execute(),
    E.fold(
        () => process.exit(1),
        () => process.exit(0)
    )
);
