import { CommandInfo } from './CommandInfo';
import { BuildContext } from './BuildContext';
import { getOrNull } from '../functions/OptionUtils';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export interface LoggableBuildContext {
	commandInfo: CommandInfo | null;
	buildToolInfo: BuildToolInfo | null;
	projectType: ProjectType | null;
	projectInfo: ProjectInfo | null;
}

export const toLoggable = (context: BuildContext): LoggableBuildContext => ({
	commandInfo: getOrNull(context.commandInfo),
	buildToolInfo: getOrNull(context.buildToolInfo),
	projectType: getOrNull(context.projectType),
	projectInfo: getOrNull(context.projectInfo)
});
