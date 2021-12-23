import { CommandInfo } from './CommandInfo';
import * as O from 'fp-ts/Option';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { Context } from './Context';

export interface IncompleteBuildContext extends Context {
	commandInfo: O.Option<CommandInfo>;
	buildToolInfo: O.Option<BuildToolInfo>;
	projectType: O.Option<ProjectType>;
	projectInfo: O.Option<ProjectInfo>;
}
