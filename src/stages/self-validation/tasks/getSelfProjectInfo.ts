import ProjectInfo from '../../../types/ProjectInfo';
import createTask, { TaskFunction } from '../../../common/execution/task';
import { TaskContext } from '../../../common/execution/context';
import path from 'path';
import fs from 'fs';
import PackageJson from '../../../types/PackageJson';
import * as TE from 'fp-ts/TaskEither';
import ProjectType from '../../../types/ProjectType';
import stageName from '../stageName';

export const TASK_NAME = 'Get Self Project Info';

const getSelfProjectInfo: TaskFunction<undefined,ProjectInfo> = (context: TaskContext<undefined>) => {
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', 'package.json'), 'utf8'));
    return TE.right({
        message: 'Loaded info about this build app',
        value: {
            projectType: ProjectType.NpmApplication,
            name: packageJson.name,
            version: packageJson.version,
            dependencies: [],
            isPreRelease: packageJson.version.includes('beta')
        }
    });
};

export default createTask(stageName, TASK_NAME, getSelfProjectInfo);