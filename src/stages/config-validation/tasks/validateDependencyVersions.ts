import ProjectInfo, { Dependency } from '../../../types/ProjectInfo';
import * as E from 'fp-ts/Either';
import { isLeft } from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import ProjectType from '../../../types/ProjectType';
import { STAGE_NAME } from '../index';
import { pipe } from 'fp-ts/pipeable';
import createTask, { TaskFunction, TaskShouldExecuteFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import { executeIfRelease } from '../../../common/execution/commonTaskConditions';

export const TASK_NAME = 'Validate Dependency Versions';

const MAVEN_CRAIG_DEP_PREFIX = 'io.craigmiller160';
const MAVEN_PRE_RELEASE_FLAG = 'SNAPSHOT';

const NPM_CRAIG_DEP_PREFIX = '@craigmiller160';
const NPM_PRE_RELEASE_FLAG = 'beta';

const validateDependencies = (prefix: string, preReleaseFlag: string, context: TaskContext<ProjectInfo>): E.Either<Error, ProjectInfo> => {
    const projectInfo = context.input;
    return pipe(
        projectInfo.dependencies,
        A.filter((dependency) => dependency.name.startsWith(prefix)),
        A.filter((dependency) => dependency.version.includes(preReleaseFlag)),
        A.reduce<Dependency, E.Either<string, ProjectInfo>>(E.right(projectInfo), (result, dependency) => {
            let message = '';
            if (isLeft(result)) {
                message = result.left;
            }

            message += `${dependency.name}:${dependency.version} `;
            return E.left(message);
        }),
        E.mapLeft((errorMessage: string) => {
            return context.createBuildError(`${preReleaseFlag} dependencies not allowed in release build: ${errorMessage}`);
        })
    );
};

const doVersionValidation = (context: TaskContext<ProjectInfo>): E.Either<Error, ProjectInfo> => {
    switch (context.input.projectType) {
        case ProjectType.MavenApplication:
        case ProjectType.MavenLibrary:
            return validateDependencies(MAVEN_CRAIG_DEP_PREFIX, MAVEN_PRE_RELEASE_FLAG, context);
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return validateDependencies(NPM_CRAIG_DEP_PREFIX, NPM_PRE_RELEASE_FLAG, context);
        default:
            return E.left(context.createBuildError('Cannot find or load project info'))
    }
};

const validateDependencyVersions: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        doVersionValidation(context),
        E.map((projectInfo) => ({
            message: 'Successfully validated dependency versions',
            value: projectInfo
        })),
        TE.fromEither
    );

export default createTask(STAGE_NAME, TASK_NAME, validateDependencyVersions, executeIfRelease);