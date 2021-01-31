import * as E from 'fp-ts/Either';
import fs from 'fs';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import ProjectType from '../../../types/ProjectType';
import { Task } from '../../../types/Build';
import BuildError from '../../../error/BuildError';
import { SUCCESS_STATUS, taskLogger } from '../../../context/logger';
import { pipe } from 'fp-ts/pipeable';
import { STAGE_NAME } from '../index';

export const TASK_NAME = 'Identify Project';

const NPM_PROJECT_FILE= 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
const DEPLOY_PATH = path.join('deploy', 'deployment.yml');

const fileExists = (file: string): boolean =>
    fs.existsSync(path.resolve(getCwd(), file));

const getProjectType = (): E.Either<Error, ProjectType> => {
    const hasNpmProjectFile = fileExists(NPM_PROJECT_FILE);
    const hasMvnProjectFile = fileExists(MVN_PROJECT_FILE);
    const hasDeployFile = fileExists(DEPLOY_PATH);

    if (hasNpmProjectFile && hasDeployFile) {
        return E.right(ProjectType.NpmApplication);
    } else if (hasNpmProjectFile) {
        return E.right(ProjectType.NpmLibrary);
    } else if (hasMvnProjectFile && hasDeployFile) {
        return E.right(ProjectType.MavenApplication);
    } else if (hasMvnProjectFile) {
        return E.right(ProjectType.MavenLibrary);
    } else {
        return E.left(new BuildError('Unable to identify project type', { taskName: TASK_NAME }));
    }
};

const identifyProject: Task<ProjectType> = () => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    return pipe(
        getProjectType(),
        E.map((projectType) => {
            taskLogger(STAGE_NAME, TASK_NAME, `Finished successfully. Project identified: ${projectType}`, SUCCESS_STATUS);
            return projectType
        })
    );
};

export default identifyProject;
