import * as E from 'fp-ts/Either';
import { InputStage } from '../../types/Build';
import ProjectInfo from '../../types/ProjectInfo';

const configValidation: InputStage<ProjectInfo, boolean> = () => {
    // TODO finish this
    return E.left(new Error());
};

export default configValidation;