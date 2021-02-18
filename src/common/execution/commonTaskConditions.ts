import { TaskShouldExecuteFunction } from './task';
import ProjectInfo from '../../types/ProjectInfo';
import { isApplication } from '../../utils/projectTypeUtils';
import ProjectType from '../../types/ProjectType';
import { BUILD_NAME as deployOnlyBuildName } from '../../execution/deployOnly';

export const executeIfRelease: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (!input.isPreRelease) {
        return undefined;
    }

    return {
        message: 'Project is not release version',
        defaultResult: input
    };
};

export const executeIfNpmPreRelease: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (input.projectType !== ProjectType.NpmLibrary && input.projectType !== ProjectType.NpmApplication) {
        return {
            message: 'Project is not Npm project',
            defaultResult: input
        };
    }

    if (!input.isPreRelease) {
        return {
            message: 'Npm project is not pre-release version',
            defaultResult: input
        };
    }

    return undefined;
};

export const executeIfNpmProject: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (input.projectType !== ProjectType.NpmLibrary && input.projectType !== ProjectType.NpmApplication) {
        return {
            message: 'Project is not Npm project',
            defaultResult: input
        };
    }

    return undefined;
}

export const executeIfApplication: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (isApplication(input.projectType)) {
        return undefined;
    }

    return {
        message: 'Project is not application',
        defaultResult: input
    };
};

export const executeIfNotDeployOnlyBuild: TaskShouldExecuteFunction<ProjectInfo> = (input: ProjectInfo) => {
    if (process.env.BUILD_NAME !== deployOnlyBuildName) {
        return undefined;
    }

    return {
        message: 'Not running for deploy only build',
        defaultResult: input
    };
}