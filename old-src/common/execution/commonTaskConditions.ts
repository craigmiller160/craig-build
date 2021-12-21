import { TaskShouldExecuteFunction } from './task';
import ProjectInfo from '../../types/ProjectInfo';
import {
	isApplication,
	isDocker,
	isLibrary,
	isMaven,
	isNpm
} from '../../utils/projectTypeUtils';
import { DEPLOY_ONLY_BUILD } from '../../execution/executionConstants';

export const executeIfRelease: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (!input.isPreRelease) {
		return undefined;
	}

	return {
		message: 'Project is not release version',
		defaultResult: input
	};
};

export const executeIfPreRelease: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (input.isPreRelease) {
		return undefined;
	}

	return {
		message: 'Project is not pre-release version',
		defaultResult: input
	};
};

export const executeIfNpmProject: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (isNpm(input.projectType)) {
		return undefined;
	}

	return {
		message: 'Project is not Npm project',
		defaultResult: input
	};
};

export const executeIfMavenProject: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (isMaven(input.projectType)) {
		return undefined;
	}

	return {
		message: 'Project is not Maven project',
		defaultResult: input
	};
};

export const executeIfApplication: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (isApplication(input.projectType)) {
		return undefined;
	}

	return {
		message: 'Project is not application',
		defaultResult: input
	};
};

export const executeIfLibrary: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (isLibrary(input.projectType)) {
		return undefined;
	}

	return {
		message: 'Project is not library',
		defaultResult: input
	};
};

export const executeIfDeployOnlyBuild: TaskShouldExecuteFunction<
	ProjectInfo
> = (input: ProjectInfo) => {
	if (process.env.BUILD_NAME === DEPLOY_ONLY_BUILD) {
		return undefined;
	}

	return {
		message: 'Not deploy-only build',
		defaultResult: input
	};
};

export const executeIfNotDeployOnlyBuild: TaskShouldExecuteFunction<
	ProjectInfo
> = (input: ProjectInfo) => {
	if (process.env.BUILD_NAME !== DEPLOY_ONLY_BUILD) {
		return undefined;
	}

	return {
		message: 'Is deploy-only build',
		defaultResult: input
	};
};

export const executeIfNotDocker: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (!isDocker(input.projectType)) {
		return undefined;
	}

	return {
		message: 'Is docker project',
		defaultResult: input
	};
};

export const executeIfNotDockerPreRelease: TaskShouldExecuteFunction<
	ProjectInfo
> = (input: ProjectInfo) => {
	if (!isDocker(input.projectType) || !input.isPreRelease) {
		return undefined;
	}

	return {
		message: 'Is a docker pre-release project',
		defaultResult: input
	};
};
