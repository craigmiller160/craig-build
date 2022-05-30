import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { ProjectType } from '../../src/context/ProjectType';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { VersionType } from '../../src/context/VersionType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import '@relmify/jest-fp-ts';

const baseBuildContext = createBuildContext();

describe('caching raw project data', () => {
	beforeEach(() => {
		process.env.NODE_ENV = '';
	});

	afterEach(() => {
		process.env.NODE_ENV = 'test';
	});

	it('loads the data once, uses cache after that', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseLibrary')
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};
		// Reads the actual project file
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmPreReleaseLibrary')
		);

		const differentBuildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};
		// Re-uses the same project file from cache despite args being different
		const result2 = await getProjectInfo.execute(differentBuildContext)();
		expect(result2).toEqualRight(expectedContext);
	});
});
