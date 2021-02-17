import * as TE from 'fp-ts/TaskEither';
import createStage, { StageFunction } from '../../common/execution/stage';
import { StageContext } from '../../common/execution/context';

export const STAGE_NAME = 'Self-Validation';

// TODO figure out better types
const selfValidation: StageFunction<any> = (context: StageContext<any>) => {
    return TE.left(new Error('Finish this'));
};

export default createStage(STAGE_NAME, selfValidation);