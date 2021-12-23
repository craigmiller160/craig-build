import { CommandInfo } from './CommandInfo';
import { getOrNull } from '../functions/OptionUtils';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { IncompleteBuildContext } from './IncompleteBuildContext';
import { Context } from './Context';

export interface LoggableIncompleteBuildContext extends Context {
	commandInfo: CommandInfo | null;
	buildToolInfo: BuildToolInfo | null;
	projectType: ProjectType | null;
	projectInfo: ProjectInfo | null;
}

export const toLoggable = (
	context: IncompleteBuildContext
): LoggableIncompleteBuildContext => ({
	commandInfo: getOrNull(context.commandInfo),
	buildToolInfo: getOrNull(context.buildToolInfo),
	projectType: getOrNull(context.projectType),
	projectInfo: getOrNull(context.projectInfo)
});
