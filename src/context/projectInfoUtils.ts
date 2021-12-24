import { ProjectInfo } from './ProjectInfo';

export const isRelease = (projectInfo: ProjectInfo): boolean =>
	!projectInfo.isPreRelease;

export const isPreRelease = (projectInfo: ProjectInfo): boolean =>
	projectInfo.isPreRelease;
