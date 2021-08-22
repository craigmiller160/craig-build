import * as TE from 'fp-ts/TaskEither';
import createStage, { StageFunction } from '../../common/execution/stage';
import { StageContext } from '../../common/execution/context';
import getSelfProjectInfo from './tasks/getSelfProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import getNexusProjectInfo from '../../common/tasks/getNexusProjectInfo';
import validateNexusVersion from '../../common/tasks/validateNexusVersion';
import stageName from './stageName';

const selfValidation: StageFunction<undefined> = (context: StageContext<undefined>) =>
    pipe(
        getSelfProjectInfo(undefined),
        TE.chain(getNexusProjectInfo(stageName)),
        TE.map((projectInfo) => {
            const projectInfoString = JSON.stringify(projectInfo, null, 2);
            context.logger(`craig-build ProjectInfo: ${projectInfoString}`);
            return projectInfo;
        }),
        TE.chain(validateNexusVersion(stageName)),
        TE.map(() => ({
            message: 'Successfully validated build application',
            value: undefined
        }))
    );

export default createStage(stageName, selfValidation);