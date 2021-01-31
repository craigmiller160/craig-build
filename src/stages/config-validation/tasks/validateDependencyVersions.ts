import ProjectInfo from '../../../types/ProjectInfo';
import { InputTask } from '../../../types/Build';
import * as E from 'fp-ts/Either';

const validateDependencyVersions: InputTask<ProjectInfo,boolean> = (projectInfo: ProjectInfo) => {
    // TODO finish this
    return E.left(new Error());
};

export default validateDependencyVersions;