import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { getCwdMock } from '../testutils/getCwdMock';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import path from 'path';
import { validateKubernetesConfig } from '../../src/stages/validateKubernetesConfig';
import '@relmify/jest-fp-ts';

const baseBuildContext = createBuildContext();

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
		throw new Error();
	});

	it('kubernetes config does not have version placeholder', async () => {
		throw new Error();
	});

	it('kubernetes config has wrong project name', async () => {
		throw new Error();
	});

	it('kubernetes config has wrong repo prefix', async () => {
		throw new Error();
	});
});
