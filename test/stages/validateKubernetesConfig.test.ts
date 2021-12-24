import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { getCwdMock } from '../testutils/getCwdMock';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import path from 'path';
import { validateKubernetesConfig } from '../../src/stages/validateKubernetesConfig';
import '@relmify/jest-fp-ts';
import { ProjectInfo } from '../../src/context/ProjectInfo';

const baseBuildContext = createBuildContext();
const projectInfo: ProjectInfo = {
	group: 'io.craigmiller160',
	name: 'email-service',
	version: '1.0.0',
	isPreRelease: false
};

describe('validateKubernetesConfig', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips for NpmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'mavenReleaseApplicationWrongKubeVersion'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('skips for MavenLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'mavenReleaseApplicationWrongKubeVersion'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenLibrary
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('skips for DockerImage', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'mavenReleaseApplicationWrongKubeVersion'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('kubernetes config is valid', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('kubernetes config does not have version placeholder', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'mavenReleaseApplicationWrongKubeVersion'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualLeft(new Error());
	});

	it('kubernetes config has wrong image name', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'mavenReleaseApplicationWrongImageName'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualLeft(new Error());
	});

	it('kubernetes config has wrong repo prefix', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'mavenReleaseApplicationWrongRepoPrefix'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualLeft(new Error());
	});

	it('kubernetes config has totally image not matching regex', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplicationInvalidImage')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualLeft(new Error());
	});

	it('kubernetes config has no image', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplicationNoImage')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo
		};

		const result = await validateKubernetesConfig.execute(buildContext)();
		expect(result).toEqualLeft(new Error());
	})
});
