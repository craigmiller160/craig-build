import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { getCwdMock } from '../testutils/getCwdMock';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import path from 'path';
import {
	KubeValues,
	validateKubernetesConfig
} from '../../src/stages/validateKubernetesConfig';
import '@relmify/jest-fp-ts';
import { ProjectInfo } from '../../src/context/ProjectInfo';
import {
	DOCKER_REPO_PREFIX,
	IMAGE_VERSION_ENV
} from '../../src/configFileTypes/constants';
import { stringifyJson } from '../../src/functions/Json';
import { VersionType } from '../../src/context/VersionType';
import * as EU from '../../src/functions/EitherUtils';

const baseBuildContext = createBuildContext();
const projectInfo: ProjectInfo = {
	group: 'io.craigmiller160',
	name: 'email-service',
	version: '1.0.0',
	versionType: VersionType.Release
};

describe('validateKubernetesConfig', () => {
	beforeEach(() => {
		jest.resetAllMocks();
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
		const kubeValues: KubeValues = {
			repoPrefix: DOCKER_REPO_PREFIX,
			imageName: 'email-service',
			imageVersion: '1.0.0'
		};
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
		expect(result).toEqualLeft(
			new Error(
				`Kubernetes image is invalid: ${EU.getOrThrow(
					stringifyJson(kubeValues, 2)
				)}`
			)
		);
	});

	it('kubernetes config has wrong image name', async () => {
		const kubeValues: KubeValues = {
			repoPrefix: DOCKER_REPO_PREFIX,
			imageName: 'other-image',
			imageVersion: IMAGE_VERSION_ENV
		};
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
		expect(result).toEqualLeft(
			new Error(
				`Kubernetes image is invalid: ${EU.getOrThrow(
					stringifyJson(kubeValues, 2)
				)}`
			)
		);
	});

	it('kubernetes config has wrong repo prefix', async () => {
		const kubeValues: KubeValues = {
			repoPrefix: 'foobar.ddns.net:30004',
			imageName: 'email-service',
			imageVersion: IMAGE_VERSION_ENV
		};
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
		expect(result).toEqualLeft(
			new Error(
				`Kubernetes image is invalid: ${EU.getOrThrow(
					stringifyJson(kubeValues, 2)
				)}`
			)
		);
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
		expect(result).toEqualLeft(
			new Error('Kubernetes image does not match pattern')
		);
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
		expect(result).toEqualLeft(
			new Error('Kubernetes config is missing image')
		);
	});
});
