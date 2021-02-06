import { StageContext } from './context';
import { createBuildError } from '../../error/BuildError';
import { createStageLogger, SUCCESS_STATUS } from '../logger';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';
import { Result } from './result';

export type StageFunction<Input,ResultValue = Input> = (context: StageContext<Input>) => TE.TaskEither<Error, Result<ResultValue>>;

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

