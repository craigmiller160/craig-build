import identify from './stages/identify';
import { buildLogger } from './context/logger';
import getCwd from './utils/getCwd';
import { pipe } from 'fp-ts/pipeable';

buildLogger(`Starting build for: ${getCwd()}`);

pipe(
    identify()
);
