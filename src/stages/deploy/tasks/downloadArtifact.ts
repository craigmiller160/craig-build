import path from 'path'
import fs from 'fs';
import * as TE from 'fp-ts/TaskEither';
import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import stageName from '../stageName';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';

const TASK_NAME = 'Download Artifact';

const downloadArtifact: TaskFunction<ProjectInfo> = (context: TaskContext<ProjectInfo>) => {
    return TE.left(new Error());
};

export default createTask(stageName, TASK_NAME, downloadArtifact, executeIfApplication);