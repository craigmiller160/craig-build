import * as TE from 'fp-ts/TaskEither';
import createStage, { StageFunction } from '../../common/execution/stage';
import { StageContext } from '../../common/execution/context';
import getSelfProjectInfo from './tasks/getSelfProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import getNexusProjectInfo from '../../common/tasks/getNexusProjectInfo';
import validateNexusVersion from '../../common/tasks/validateNexusVersion';

export const STAGE_NAME = 'Self-Validation';

const selfValidation: StageFunction<undefined> = (context: StageContext<undefined>) =>
    pipe(
        getSelfProjectInfo(undefined),
        TE.chain(getNexusProjectInfo),
        TE.chain(validateNexusVersion),
        TE.map(() => ({
            message: 'Successfully validated build application',
            value: undefined
        }))
    );

export default createStage(STAGE_NAME, selfValidation);