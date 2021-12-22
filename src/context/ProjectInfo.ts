import { ProjectType } from './ProjectType';

export interface Dependency {
	name: string;
	version: string;
}

export interface ProjectInfo {
	projectType: ProjectType;
	group: string;
	name: string;
	version: string;
	isPreRelease: boolean;
	dependencies: Dependency[];
}
