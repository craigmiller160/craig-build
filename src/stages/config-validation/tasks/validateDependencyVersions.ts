import ProjectInfo from '../../../types/ProjectInfo';
import { InputTask } from '../../../types/Build';
import * as E from 'fp-ts/Either';
import ProjectType from '../../../types/ProjectType';
import BuildError from '../../../error/BuildError';
import { SUCCESS_STATUS, taskLogger } from '../../../common/logger';
import { STAGE_NAME } from '../index';
import { pipe } from 'fp-ts/pipeable';

const TASK_NAME = 'Validate Dependency Versions';

const validateMavenVersions = (projectInfo: ProjectInfo) => {

};

const validateNpmVersions = (projectInfo: ProjectInfo) => {

};

const doVersionValidation = (projectInfo: ProjectInfo): E.Either<Error, ProjectInfo> => {
    switch (projectInfo.projectType) {
        case ProjectType.MavenApplication:
        case ProjectType.MavenLibrary:
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
        default:
            return E.left(new BuildError('Cannot find or load project info', { taskName: TASK_NAME }))
    }
};

const validateDependencyVersions: InputTask<ProjectInfo,ProjectInfo> = (projectInfo: ProjectInfo) => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    return pipe(
        doVersionValidation(projectInfo),
        E.map((projectInfo) => {
            taskLogger(STAGE_NAME, TASK_NAME, 'Finished validating dependency versions successfully', SUCCESS_STATUS);
            return projectInfo;
        })
    );
};

export default validateDependencyVersions;