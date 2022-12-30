import { setupBuildContext } from '../src/setup';
import { CommandType } from '../src/context/CommandType';
import { VersionType } from '../src/context/VersionType';
import { ProjectType } from '../src/context/ProjectType';

describe('setup', () => {
	it('setupBuildContext', () => {
		const buildContext = setupBuildContext();
		expect(buildContext).toEqual({
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
	});
});
