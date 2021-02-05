import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { InputStage } from '../../types/Build';
import ProjectInfo from '../../types/ProjectInfo';
import { stageLogger } from '../../common/logger';
import { pipe } from 'fp-ts/pipeable';
import validateDependencyVersions from './tasks/validateDependencyVersions';
import { isApplication } from '../../utils/projectTypeUtils';
import validateKubeVersion from './tasks/validateKubeVersion';
import validateGitTag from './tasks/validateGitTag';
import { StageContext } from '../../common/execution/context';
import createStage, { StageFunction } from '../../common/execution/stage';

export const STAGE_NAME = 'Config Validation';

const configValidation: StageFunction<ProjectInfo, ProjectInfo> = (context: StageContext<ProjectInfo>) =>
    pipe(
        validateDependencyVersions(context.input),
        TE.chain((projectInfo) => {
            if (isApplication(projectInfo.projectType)) {
                return validateKubeVersion(projectInfo);
            }
            return TE.right(projectInfo);
        }),
        TE.chain((projectInfo) => {
            if (!projectInfo.isPreRelease) {
                return validateGitTag(projectInfo);
            }
            return TE.right(projectInfo);
        }),
        TE.map((projectInfo) => ({
            message: 'Configuration validation successful',
            value: projectInfo
        }))
    );

export default createStage(STAGE_NAME, configValidation);
