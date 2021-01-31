import * as E from 'fp-ts/Either';
import { Task } from '../../../types/Build';

const validateGitTask: Task<boolean> = () => {
    // TODO finish this
    return E.left(new Error());
};

export default validateGitTask;