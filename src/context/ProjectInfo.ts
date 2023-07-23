import { VersionType } from './VersionType';
import { NpmBuildTool } from './NpmBuildTool';

export interface ProjectInfo {
	readonly group: string;
	readonly name: string;
	readonly version: string;
	readonly versionType: VersionType;
	readonly npmBuildTool?: NpmBuildTool;
}
