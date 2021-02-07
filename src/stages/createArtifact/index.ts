import { StageFunction } from '../../common/execution/stage';
import ProjectInfo from '../../types/ProjectInfo';
import { StageContext } from '../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import buildAndTest from './tasks/buildAndTest';
import * as TE from 'fp-ts/TaskEither';

export const STAGE_NAME = 'Create Artifact';

const createArtifact: StageFunction<ProjectInfo> = (context: StageContext<ProjectInfo>) =>
    pipe(
        buildAndTest(context.input),
        TE.map((projectInfo) => ({
            message: 'Artifact created successfully',
            value: projectInfo
        }))
    );
