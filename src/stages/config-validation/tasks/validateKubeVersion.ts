import * as E from 'fp-ts/Either';
import { Task } from '../../../types/Build';

const validateKubeVersion: Task<boolean> = () => {
    // TODO finish this
    return E.left(new Error());
};

export default validateKubeVersion;