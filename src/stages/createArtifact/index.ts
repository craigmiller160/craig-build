import createStage, { StageFunction } from '../../common/execution/stage';
import ProjectInfo from '../../types/ProjectInfo';
import { StageContext } from '../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import buildAndTest from './tasks/buildAndTest';
import * as TE from 'fp-ts/TaskEither';
import bumpNpmBeta from './tasks/bumpNpmBeta';
import publish from './tasks/publish';
import stageName from './stageName';

const createArtifact: StageFunction<ProjectInfo> = (context: StageContext<ProjectInfo>) =>
    pipe(
        buildAndTest(context.input),
        TE.chain(bumpNpmBeta),
        TE.chain(publish),
        TE.map((projectInfo) => ({
            message: 'Artifact created successfully',
            value: projectInfo
        }))
    );

export default createStage(stageName, createArtifact);
