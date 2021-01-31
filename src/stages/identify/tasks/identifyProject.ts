import * as E from 'fp-ts/es6/Either';
import fs from 'fs';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import ProjectType from '../../../types/ProjectType';
import { TaskContext } from '../../../context';
import { Task } from '../../../types/Build';
import BuildError from '../../../error/BuildError';

const NPM_PROJECT_FILE= 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
const DEPLOY_DIR = 'deploy';

const fileExists = (file: string): boolean =>
    fs.existsSync(path.resolve(getCwd(), file));

const fileExistsAndIsDirectory = (file: string): boolean =>
    fileExists(file) && fs.lstatSync(path.resolve(getCwd(), file)).isDirectory();

const identifyProject: Task<ProjectType> = () => {
    const hasNpmProjectFile = fileExists(NPM_PROJECT_FILE);
    const hasMvnProjectFile = fileExists(MVN_PROJECT_FILE);
    const hasDeployDir = fileExistsAndIsDirectory(DEPLOY_DIR);

    if (hasNpmProjectFile && hasDeployDir) {
        return E.right(ProjectType.NpmApplication);
    } else if (hasNpmProjectFile) {
        return E.right(ProjectType.NpmLibrary);
    } else if (hasMvnProjectFile && hasDeployDir) {
        return E.right(ProjectType.MavenApplication);
    } else if (hasMvnProjectFile) {
        return E.right(ProjectType.MavenLibrary);
    } else {
        return E.left(new BuildError('Unable to identify project type'));
    }
};

export default identifyProject;
