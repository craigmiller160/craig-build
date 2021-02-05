/*
 * 1. Args for the function
 * 2. Starting log message
 * 3. Call implementation function, pass args
 * 4. Finish log message
 */

import { StageContext } from './context';
import { createBuildError } from '../../error/BuildError';
import { stageLogger, SUCCESS_STATUS } from '../logger';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { Result } from './result';

export type StageFunction = <Input,ResultValue>(context: StageContext<Input>) => E.Either<Error, Result<ResultValue>>;

const createStage = (stageName: string, stageFn: StageFunction) => <Input, ResultValue>(input: Input): E.Either<Error, ResultValue> => {
    const stageContext: StageContext<Input> = {
        stageName,
        createBuildError: createBuildError(stageName),
        input
    };

    stageLogger(stageName, 'Starting...');

    return pipe(
        stageFn<Input,ResultValue>(stageContext),
        E.map((result) => {
            stageLogger(stageName, `Finished. ${result.message}`, SUCCESS_STATUS);
            return result.value;
        })
    );
};

export default createStage;

