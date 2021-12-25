import { CommandInfo } from './CommandInfo';
import { getOrNull } from '../functions/OptionUtils';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { IncompleteBuildContext } from './IncompleteBuildContext';
import { Context } from './Context';

export interface LoggableBuildContext extends Context {
	readonly commandInfo: CommandInfo | null;
	readonly buildToolInfo: BuildToolInfo | null;
	readonly projectType: ProjectType | null;
	readonly projectInfo: ProjectInfo | null;
}

export const incompleteToLoggableContext = (
	context: IncompleteBuildContext
): LoggableBuildContext => ({
	commandInfo: getOrNull(context.commandInfo),
	buildToolInfo: getOrNull(context.buildToolInfo),
	projectType: getOrNull(context.projectType),
	projectInfo: getOrNull(context.projectInfo)
});
