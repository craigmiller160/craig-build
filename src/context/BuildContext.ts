import { CommandInfo } from './CommandInfo';
import * as O from 'fp-ts/Option';
import { OptionValues } from 'commander';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';

export interface BuildContext {
	options: OptionValues;
	commandInfo: O.Option<CommandInfo>;
	buildToolInfo: O.Option<BuildToolInfo>;
	projectType: O.Option<ProjectType>;
	projectInfo: O.Option<ProjectInfo>;
}
