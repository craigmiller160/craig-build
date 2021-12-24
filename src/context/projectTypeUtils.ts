import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export const isMaven = (projectType: ProjectType): boolean =>
	[ProjectType.MavenApplication, ProjectType.MavenLibrary].includes(
		projectType
	);

export const isNpm = (projectType: ProjectType): boolean =>
	[ProjectType.NpmApplication, ProjectType.NpmLibrary].includes(projectType);

export const isDocker = (projectType: ProjectType): boolean =>
	[ProjectType.DockerApplication, ProjectType.DockerImage].includes(
		projectType
	);

export const isRelease = (projectInfo: ProjectInfo): boolean =>
	!projectInfo.isPreRelease;

export const isPreRelease = (projectInfo: ProjectInfo): boolean =>
	projectInfo.isPreRelease;

export const isApplication = (projectType: ProjectType): boolean =>
	[
		ProjectType.DockerApplication,
		ProjectType.MavenApplication,
		ProjectType.NpmApplication
	].includes(projectType);
