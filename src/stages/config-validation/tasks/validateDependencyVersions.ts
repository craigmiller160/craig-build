import ProjectInfo from '../../../types/ProjectInfo';
import { InputTask } from '../../../types/Build';
import * as E from 'fp-ts/Either';

const validateMavenVersions = (projectInfo: ProjectInfo) => {

};

const validateNpmVersions = (projectInfo: ProjectInfo) => {

};

const doVersionValidation = (projectInfo: ProjectInfo) => {

};

const validateDependencyVersions: InputTask<ProjectInfo,boolean> = (projectInfo: ProjectInfo) => {
    // TODO finish this
    return E.left(new Error());
};

export default validateDependencyVersions;