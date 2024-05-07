import { BuildContext } from '../../src/context/BuildContext';
import { CommandInfo } from '../../src/context/CommandInfo';
import { CommandType } from '../../src/context/CommandType';
import { BuildToolInfo } from '../../src/context/BuildToolInfo';
import { ProjectType } from '../../src/context/ProjectType';
import { ProjectInfo } from '../../src/context/ProjectInfo';
import { VersionType } from '../../src/context/VersionType';

const defaultCommandInfo: CommandInfo = {
	type: CommandType.FullBuild
};
const defaultBuildToolInfo: BuildToolInfo = {
	group: 'craigmiller160',
	name: 'craig-build',
	version: '2.0.0',
	versionType: VersionType.Release
};

const defaultProjectType: ProjectType = ProjectType.NpmLibrary;

const defaultProjectInfo: ProjectInfo = {
	group: 'craigmiller160',
	name: 'my-project',
	version: '1.0.0',
	versionType: VersionType.Release,
	repoType: 'polyrepo'
};

const defaultBuildContext: BuildContext = {
	commandInfo: defaultCommandInfo,
	buildToolInfo: defaultBuildToolInfo,
	projectType: defaultProjectType,
	projectInfo: defaultProjectInfo,
	hasTerraform: false,
	doGitTag: true
};

export const createBuildContext = ({
	commandInfo = defaultCommandInfo,
	buildToolInfo = defaultBuildToolInfo,
	projectType = defaultProjectType,
	projectInfo = defaultProjectInfo,
	hasTerraform = defaultBuildContext.hasTerraform
}: Partial<BuildContext> = defaultBuildContext): BuildContext => ({
	commandInfo,
	buildToolInfo,
	projectType,
	projectInfo,
	hasTerraform,
	doGitTag: true
});
