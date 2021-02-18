import * as TE from 'fp-ts/TaskEither';
import ProjectInfo from '../../types/ProjectInfo';
import { pipe } from 'fp-ts/pipeable';
import validateDependencyVersions from './tasks/validateDependencyVersions';
import validateKubeVersion from './tasks/validateKubeVersion';
import validateGitTag from './tasks/validateGitTag';
import { StageContext } from '../../common/execution/context';
import createStage, { StageFunction } from '../../common/execution/stage';
import validateNexusVersion from '../../common/tasks/validateNexusVersion';
import stageName from './stageName';

const configValidation: StageFunction<ProjectInfo> = (context: StageContext<ProjectInfo>) =>
    pipe(
        validateDependencyVersions(context.input),
        TE.chain(validateKubeVersion),
        TE.chain(validateGitTag),
        TE.chain(validateNexusVersion(stageName)),
        TE.map((projectInfo) => ({
            message: 'Configuration validation successful',
            value: projectInfo
        }))
    );

export default createStage(stageName, configValidation);
