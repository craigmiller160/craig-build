import { VersionType } from './VersionType';

export interface ProjectInfo {
	readonly group: string;
	readonly name: string;
	readonly version: string;
	readonly versionType: VersionType;
}
