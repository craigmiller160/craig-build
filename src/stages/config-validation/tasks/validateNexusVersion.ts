import * as E from 'fp-ts/Either';
import { Task } from '../../../types/Build';

const validateNexusVersion: Task<boolean> = () => {
    // TODO finish this
    return E.left(new Error());
};

export default validateNexusVersion;