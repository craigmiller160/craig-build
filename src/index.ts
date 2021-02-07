#!/usr/bin/env node

import execute from './execution';
import { pipe } from 'fp-ts/pipeable';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

// TODO accept commands of "build" for the full build/deploy and redeploy to redeploy a production artifact

pipe(
    execute(),
    TE.fold(
        () => process.exit(1),
        () => process.exit(0)
    )
)();
