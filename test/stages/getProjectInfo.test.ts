import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import * as O from 'fp-ts/Option';
import { ProjectType } from '../../src/context/ProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import '@relmify/jest-fp-ts';

const baseWorkingDirPath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__'
);

const baseBuildContext = createBuildContext();

describe('getProjectInfo', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('NPM release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'npmReleaseLibrary')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmLibrary)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0',
				isPreRelease: false
			})
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('NPM pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'npmBetaLibrary')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmLibrary)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0-beta',
				isPreRelease: true
			})
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Maven release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'mavenReleaseLibrary')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.MavenLibrary)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'lib',
				version: '1.0.0',
				isPreRelease: false
			})
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Maven pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'mavenSnapshotLibrary')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmLibrary)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'lib',
				version: '1.0.0-SNAPSHOT',
				isPreRelease: true
			})
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Docker release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'dockerReleaseImage')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.DockerImage)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'nginx-base',
				version: '1.0.0',
				isPreRelease: false
			})
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Docker pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'dockerBetaImage')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.DockerImage)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'nginx-base',
				version: '1.0.0-beta',
				isPreRelease: true
			})
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});
});
