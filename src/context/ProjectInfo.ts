import { VersionType } from './VersionType';
import { NpmBuildTool } from './NpmBuildTool';

export type RepoType = 'polyrepo' | 'monrepo';

export type ProjectInfo = Readonly<{
	group: string;
	name: string;
	version: string;
	versionType: VersionType;
	repoType: RepoType;
	npmBuildTool?: NpmBuildTool;
	monorepoChildren?: ReadonlyArray<ProjectInfo>;
}>;
