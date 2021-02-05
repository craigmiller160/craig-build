/*
 * 1. Args for the function
 * 2. Starting log message
 * 3. Call implementation function, pass args
 * 4. Finish log message
 */

import { StageContext } from './context';
import { createBuildError } from '../../error/BuildError';
import { stageLogger } from '../logger';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';

export type StageFunction = <Input,Result>(context: StageContext<Input>) => E.Either<Error, Result>;

const createStage = (stageName: string, stageFn: StageFunction) => <Input, Result>(input: Input): E.Either<Error, Result> => { // TODO improve types
    const stageContext: StageContext<Input> = {
        stageName,
        createBuildError: createBuildError(stageName),
        input
    };

    stageLogger(stageName, 'Starting...');

    return pipe(
        stageFn<Input,Result>(stageContext),
        E.map((result) => {
            // TODO final log message
            return result;
        })
    );
};

export default createStage;

