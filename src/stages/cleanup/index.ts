import createStage, { StageFunction } from '../../common/execution/stage';
import ProjectInfo from '../../types/ProjectInfo';
import { StageContext } from '../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import gitTag from './tasks/gitTag';
import * as TE from 'fp-ts/TaskEither';

export const STAGE_NAME = 'Cleanup';

const cleanup: StageFunction<ProjectInfo> = (context: StageContext<ProjectInfo>) =>
    pipe(
        gitTag(context.input),
        TE.map((projectInfo) => ({
            message: 'Cleanup complete',
            value: projectInfo
        }))
    );

export default createStage(STAGE_NAME, cleanup);
