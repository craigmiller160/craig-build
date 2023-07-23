import { VersionType } from './VersionType';
import { NpmCommand } from './NpmCommand';

export interface ProjectInfo {
	readonly group: string;
	readonly name: string;
	readonly version: string;
	readonly versionType: VersionType;
	readonly npmCommand?: NpmCommand;
}
