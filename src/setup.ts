import { BuildContext } from './context/BuildContext';
import { CommandType } from './context/CommandType';
import { VersionType } from './context/VersionType';
import { ProjectType } from './context/ProjectType';

export const setupBuildContext = (): BuildContext => ({
	commandInfo: {
		type: CommandType.Unknown
	},
	buildToolInfo: {
		group: '',
		name: '',
		version: '',
		versionType: VersionType.Unknown
	},
	projectType: ProjectType.Unknown,
	hasTerraform: false,
	projectInfo: {
		group: '',
		name: '',
		version: '',
		versionType: VersionType.Unknown
	}
});
