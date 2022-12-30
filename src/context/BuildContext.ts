import { CommandInfo } from './CommandInfo';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export interface BuildContext {
	readonly commandInfo: CommandInfo;
	readonly buildToolInfo: BuildToolInfo;
	readonly projectType: ProjectType;
	readonly projectInfo: ProjectInfo;
	readonly hasTerraform: boolean;
}
