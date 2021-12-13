import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import ProjectType from '../../../types/ProjectType';
import {pipe} from 'fp-ts/function';
import createTask, {TaskFunction} from '../../../common/execution/task';
import {TaskContext} from '../../../common/execution/context';
import stageName from '../stageName';

export const TASK_NAME = 'Identify Project';

const NPM_PROJECT_FILE= 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
const DOCKER_PROJECT_FILE = 'docker.json';
const DEPLOY_PATH = path.join('deploy', 'deployment.yml');

const fileExists = (file: string): boolean =>
    fs.existsSync(path.resolve(getCwd(), file));

const getProjectType = (context: TaskContext<undefined>): E.Either<Error, ProjectType> => {
    const hasNpmProjectFile = fileExists(NPM_PROJECT_FILE);
    const hasMvnProjectFile = fileExists(MVN_PROJECT_FILE);
    const hasDeployFile = fileExists(DEPLOY_PATH);
    const hasDockerProjectFile = fileExists(DOCKER_PROJECT_FILE);

    if (hasNpmProjectFile && hasDeployFile) {
        return E.right(ProjectType.NpmApplication);
    } else if (hasNpmProjectFile) {
        return E.right(ProjectType.NpmLibrary);
    } else if (hasMvnProjectFile && hasDeployFile) {
        return E.right(ProjectType.MavenApplication);
    } else if (hasMvnProjectFile) {
        return E.right(ProjectType.MavenLibrary);
    } else if (hasDockerProjectFile && hasDeployFile) {
        return E.right(ProjectType.DockerApplication);
    } else if (hasDockerProjectFile) {
        return E.right(ProjectType.DockerImage);
    } else {
        return E.left(context.createBuildError('Unable to identify project type'));
    }
};

const identifyProject: TaskFunction<undefined, ProjectType> = (context: TaskContext<undefined>) =>
    pipe(
        getProjectType(context),
        E.map((projectType) => ({
            message: `Project identified: ${projectType}`,
            value: projectType
        })),
        TE.fromEither
    );

export default createTask(stageName, TASK_NAME, identifyProject);
