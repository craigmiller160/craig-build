import { CommandInfo } from './CommandInfo';
import * as O from 'fp-ts/Option';
import { OptionValues } from 'commander';
import { BuildToolInfo } from './BuildToolInfo';

export interface BuildContext {
	options: OptionValues;
	commandInfo: O.Option<CommandInfo>;
	buildToolInfo: O.Option<BuildToolInfo>;
}
