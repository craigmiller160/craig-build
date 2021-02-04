import ProjectInfo, { Dependency } from '../../../types/ProjectInfo';
import { InputTask } from '../../../types/Build';
import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import ProjectType from '../../../types/ProjectType';
import BuildError from '../../../error/BuildError';
import { SUCCESS_STATUS, taskLogger } from '../../../common/logger';
import { STAGE_NAME } from '../index';
import { pipe } from 'fp-ts/pipeable';
import { isLeft } from 'fp-ts/Either';

const TASK_NAME = 'Validate Dependency Versions';

const MAVEN_CRAIG_DEP_PREFIX = 'io.craigmiller160';
const MAVEN_PRE_RELEASE_FLAG = 'SNAPSHOT';

const createError = (message: string) =>
    new BuildError(message, {
        taskName: TASK_NAME,
        stageName: STAGE_NAME
    });

const validateMavenVersions = (projectInfo: ProjectInfo): E.Either<Error, ProjectInfo> => {
    if (projectInfo.version.includes(MAVEN_PRE_RELEASE_FLAG)) {
        return E.right(projectInfo);
    }

    return pipe(
        projectInfo.dependencies,
        A.filter((dependency) => dependency.name.startsWith(MAVEN_CRAIG_DEP_PREFIX)),
        A.filter((dependency) => dependency.version.includes(MAVEN_PRE_RELEASE_FLAG)),
        A.reduce<Dependency, E.Either<string, ProjectInfo>>(E.right(projectInfo), (result, dependency) => {
            let message = '';
            if (isLeft(result)) {
                message = result.left;
            }

            message += `${dependency.name}:${dependency.version} `;
            return E.left(message);
        }),
        E.mapLeft((errorMessage: string) => {
            return createError(`SNAPSHOT dependencies not allowed in release build: ${errorMessage}`);
        })
    );
}

const validateNpmVersions = (projectInfo: ProjectInfo) => {

};

const doVersionValidation = (projectInfo: ProjectInfo): E.Either<Error, ProjectInfo> => {
    switch (projectInfo.projectType) {
        case ProjectType.MavenApplication:
        case ProjectType.MavenLibrary:
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
        default:
            return E.left(createError('Cannot find or load project info'))
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