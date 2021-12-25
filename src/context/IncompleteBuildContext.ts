import { CommandInfo } from './CommandInfo';
import * as O from 'fp-ts/Option';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { Context } from './Context';

export interface IncompleteBuildContext extends Context {
	readonly commandInfo: O.Option<CommandInfo>;
	readonly buildToolInfo: O.Option<BuildToolInfo>;
	readonly projectType: O.Option<ProjectType>;
	readonly projectInfo: O.Option<ProjectInfo>;
}
