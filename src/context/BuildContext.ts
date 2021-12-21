import { CommandInfo } from './CommandInfo';
import * as O from 'fp-ts/Option';
import { OptionValues } from 'commander';

export interface BuildContext {
	options: OptionValues;
	commandInfo: O.Option<CommandInfo>;
}
