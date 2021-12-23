import { CommandInfo } from './CommandInfo';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { Context } from './Context';

export interface BuildContext extends Context {
	commandInfo: CommandInfo;
	buildToolInfo: BuildToolInfo;
	projectType: ProjectType;
	projectInfo: ProjectInfo;
}
