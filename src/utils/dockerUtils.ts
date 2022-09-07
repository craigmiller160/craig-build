import { ProjectInfo } from '../context/ProjectInfo';
import { DOCKER_REPO_PREFIX } from '../configFileTypes/constants';

export const createDockerImageTag = (projectInfo: ProjectInfo): string =>
	`${DOCKER_REPO_PREFIX}/${projectInfo.name}:${projectInfo.version}`;
