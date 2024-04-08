import { VersionType } from './VersionType';
import { NpmBuildTool } from './NpmBuildTool';

export type ProjectInfo = Readonly<{
	group: string;
	name: string;
	version: string;
	versionType: VersionType;
	npmBuildTool?: NpmBuildTool;
	monorepoChildren?: ReadonlyArray<ProjectInfo>;
}>;
