import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { pipe } from 'fp-ts/pipeable';
import { STAGE_NAME } from '../index';
import * as TE from 'fp-ts/TaskEither';
import ProjectType from '../../../types/ProjectType';
import runCommand from '../../../utils/runCommand';

export const TASK_NAME = 'Build & Test';

const MAVEN_BUILD_CMD = 'mvn clean deploy';
const NPM_BUILD_CMD = 'yarn build';

const npmBuildAndTest = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> =>
    pipe(
        runCommand(NPM_BUILD_CMD),
        TE.fromEither,
        TE.map(() => context.input)
    );

const mavenBuildAndTest = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    context.logger('Maven will automatically perform publish step if build successful');
    return pipe(
        runCommand(MAVEN_BUILD_CMD),
        TE.fromEither,
        TE.map(() => context.input)
    );
};

const doBuildAndTest = (context: TaskContext<ProjectInfo>): TE.TaskEither<Error, ProjectInfo> => {
    switch (context.input.projectType) {
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return npmBuildAndTest(context);
        case ProjectType.MavenLibrary:
        case ProjectType.MavenApplication:
            return mavenBuildAndTest(context);
        default:
            return TE.left(new Error(`Invalid project type: ${context.input.projectType}`));
    }
};

const buildAndTest: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) =>
    pipe(
        doBuildAndTest(context),
        TE.map((projectInfo) => ({
            message: 'Successfully built and tested project',
            value: projectInfo
        }))
    );

export default createTask(STAGE_NAME, TASK_NAME, buildAndTest);
