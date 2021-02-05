import * as E from 'fp-ts/Either';
import { InputStage } from '../../types/Build';
import ProjectInfo from '../../types/ProjectInfo';
import { stageLogger } from '../../common/logger';
import { pipe } from 'fp-ts/pipeable';
import validateDependencyVersions from './tasks/validateDependencyVersions';
import { isApplication } from '../../utils/projectTypeUtils';
import validateKubeVersion from './tasks/validateKubeVersion';
import validateGitTag from './tasks/validateGitTag';

export const STAGE_NAME = 'Config Validation';

const configValidation: InputStage<ProjectInfo, ProjectInfo> = (projectInfo: ProjectInfo) => {
    stageLogger(STAGE_NAME, 'Starting...');
    return pipe(
        validateDependencyVersions(projectInfo),
        E.chain((projectInfo) => {
            if (isApplication(projectInfo.projectType)) {
                return validateKubeVersion(projectInfo);
            }
            return E.right(projectInfo);
        }),
        E.chain((projectInfo) => {
            if (!projectInfo.isPreRelease) {
                return validateGitTag(projectInfo);
            }
            return E.right(projectInfo);
        })
    );
};

export default configValidation;
