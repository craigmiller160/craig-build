#!/usr/bin/env node

import execute from './execution';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

pipe(
    execute(),
    TE.fold(
        () => process.exit(1),
        () => process.exit(0)
    )
);
