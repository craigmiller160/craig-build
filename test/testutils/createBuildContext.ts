import { BuildContext } from '../../src/context/BuildContext';
import { CommandInfo } from '../../src/context/CommandInfo';
import { CommandType } from '../../src/context/CommandType';
import * as O from 'fp-ts/Option';
import { BuildToolInfo } from '../../src/context/BuildToolInfo';
import { ProjectType } from '../../src/context/ProjectType';
import { ProjectInfo } from '../../src/context/ProjectInfo';
import { IncompleteBuildContext } from '../../src/context/IncompleteBuildContext';

const defaultCommandInfo: CommandInfo = {
	type: CommandType.FullBuild
};
const defaultBuildToolInfo: BuildToolInfo = {
	group: 'craigmiller160',
	name: 'craig-build',
	version: '2.0.0',
	isPreRelease: false
};

const defaultProjectType: ProjectType = ProjectType.NpmLibrary;

const defaultProjectInfo: ProjectInfo = {
	group: 'craigmiller150',
	name: 'my-project',
	version: '1.0.0',
	isPreRelease: false
};

const defaultBuildContext: BuildContext = {
	commandInfo: defaultCommandInfo,
	buildToolInfo: defaultBuildToolInfo,
	projectType: defaultProjectType,
	projectInfo: defaultProjectInfo
};

const defaultIncompleteBuildContext: IncompleteBuildContext = {
	commandInfo: O.some(defaultCommandInfo),
	buildToolInfo: O.some(defaultBuildToolInfo),
	projectType: O.some(defaultProjectType),
	projectInfo: O.some(defaultProjectInfo)
};

export const createIncompleteBuildContext = ({
	commandInfo = O.some(defaultCommandInfo),
	buildToolInfo = O.some(defaultBuildToolInfo),
	projectType = O.some(defaultProjectType),
	projectInfo = O.some(defaultProjectInfo)
}: Partial<IncompleteBuildContext> = defaultIncompleteBuildContext): IncompleteBuildContext => ({
	commandInfo,
	buildToolInfo,
	projectType,
	projectInfo
});

export const createBuildContext = ({
	commandInfo = defaultCommandInfo,
	buildToolInfo = defaultBuildToolInfo,
	projectType = defaultProjectType,
	projectInfo = defaultProjectInfo
}: Partial<BuildContext> = defaultBuildContext): BuildContext => ({
	commandInfo,
	buildToolInfo,
	projectType,
	projectInfo
});
