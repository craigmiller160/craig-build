import { CommandInfo } from './CommandInfo';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export type BuildContext = Readonly<{
	commandInfo: CommandInfo;
	buildToolInfo: BuildToolInfo;
	projectType: ProjectType;
	projectInfo: ProjectInfo;
	hasTerraform: boolean;
	doGitTag: boolean;
}>;
