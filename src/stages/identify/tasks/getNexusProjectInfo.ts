import { InputTask } from '../../../types/Build';
import ProjectInfo from '../../../types/ProjectInfo';
import * as E from 'fp-ts/Either';

const getNexusProjectInfo: InputTask<ProjectInfo, ProjectInfo> = (projectInfo: ProjectInfo) => {
    // TODO finish this
    return E.left(new Error());
};

export default getNexusProjectInfo;