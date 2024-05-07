import { describe, it, expect } from 'vitest';
import { setupBuildContext } from '../src/setup';
import { CommandType } from '../src/context/CommandType';
import { VersionType } from '../src/context/VersionType';
import { ProjectType } from '../src/context/ProjectType';
import { BuildContext } from '../src/context/BuildContext';

describe('setup', () => {
	it('setupBuildContext', () => {
		const buildContext = setupBuildContext();
		expect(buildContext).toEqual<BuildContext>({
			commandInfo: {
				type: CommandType.Unknown
			},
			doGitTag: true,
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
				versionType: VersionType.Unknown,
				repoType: 'polyrepo'
			}
		});
	});
});
