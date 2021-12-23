import { CommandInfo } from './CommandInfo';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export interface BuildContext {
	commandInfo: CommandInfo;
	buildToolInfo: BuildToolInfo;
	projectType: ProjectType;
	projectInfo: ProjectInfo;
}
