import * as TE from 'fp-ts/TaskEither';
import { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';

const validateNexusVersion: TaskFunction<boolean> = (context: TaskContext<boolean>) => {
    // TODO finish this
    return TE.left(new Error());
};

export default validateNexusVersion;