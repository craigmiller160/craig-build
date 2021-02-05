/*
 * 1. Args for the function
 * 2. Starting log message
 * 3. Call implementation function, pass args
 * 4. Finish log message
 */

import { StageContext } from './context';
import { createBuildError } from '../../error/BuildError';
import { createStageLogger, SUCCESS_STATUS } from '../logger';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import { Result } from './result';

// TODO when input and output are the same, don't need to put it in twice
export type StageFunction<Input,ResultValue> = (context: StageContext<Input>) => TE.TaskEither<Error, Result<ResultValue>>;

// TODO when stages are added to execution, ensure they are the Stage type

// TODO when skipping a stage, include a log entry for it

const createStage = <Input, ResultValue>(stageName: string, stageFn: StageFunction<Input, ResultValue>) => (input: Input): TE.TaskEither<Error, ResultValue> => {
    const stageContext: StageContext<Input> = {
        stageName,
        createBuildError: createBuildError(stageName),
        input,
        logger: createStageLogger(stageName)
    };

    stageContext.logger('Starting...');

    return pipe(
        stageFn(stageContext),
        TE.map((result) => {
            stageContext.logger(`Finished. ${result.message}`, SUCCESS_STATUS);
            return result.value;
        })
    );
};

export default createStage;

