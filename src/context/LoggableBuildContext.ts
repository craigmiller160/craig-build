import { OptionValues } from 'commander';
import { CommandInfo } from './CommandInfo';
import { BuildContext } from './BuildContext';
import { getOrNull } from '../functions/OptionUtils';
import { BuildToolInfo } from './BuildToolInfo';

export interface LoggableBuildContext {
	options: OptionValues;
	commandInfo: CommandInfo | null;
	buildToolInfo: BuildToolInfo | null;
}

export const toLoggable = (context: BuildContext): LoggableBuildContext => ({
	options: context.options,
	commandInfo: getOrNull(context.commandInfo),
	buildToolInfo: getOrNull(context.buildToolInfo)
});
