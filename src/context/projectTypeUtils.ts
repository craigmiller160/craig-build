import { ProjectType } from './ProjectType';

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
