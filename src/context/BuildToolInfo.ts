import { VersionType } from './VersionType';

export interface BuildToolInfo {
	readonly group: string;
	readonly name: string;
	readonly version: string;
	readonly versionType: VersionType;
}
