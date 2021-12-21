import { OptionValues } from 'commander';
import { CommandInfo } from './CommandInfo';
import { BuildContext } from './BuildContext';
import { getOrNull } from '../functions/OptionUtils';

export interface LoggableBuildContext {
	options: OptionValues;
	commandInfo: CommandInfo | null;
}

export const toLoggable = (context: BuildContext) => ({
	options: context.options,
	commandInfo: getOrNull(context.commandInfo)
});
