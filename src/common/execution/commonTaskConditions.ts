import { TaskShouldExecuteFunction } from './task';
import ProjectInfo from '../../types/ProjectInfo';
import { isApplication } from '../../utils/projectTypeUtils';

export const executeIfRelease: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (!input.isPreRelease) {
        return undefined;
    }

    return {
        message: 'Project is not release version',
        defaultResult: input
    };
};

export const executeIfApplication: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (isApplication(input.projectType)) {
        return undefined;
    }

    return {
        message: 'Project is not application',
        defaultResult: input
    };
};