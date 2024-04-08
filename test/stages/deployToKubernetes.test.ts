import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { getCwdMock } from '../testutils/getCwdMock';
import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import {
	deployToKubernetes,
	K8S_CTX,
	K8S_NS
} from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';
import { taskEither } from 'fp-ts';
import { VersionType } from '../../src/context/VersionType';
import { BuildContext } from '../../src/context/BuildContext';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { ProjectType } from '../../src/context/ProjectType';
import path from 'path';
import { createDockerImageTag } from '../../src/utils/dockerUtils';
import shellEnv from 'shell-env';

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		versionType: VersionType.Release
	}
});

vi.mock('shell-env', () => ({
	sync: vi.fn()
}));

const shellEnvMock = shellEnv.sync as MockedFunction<typeof shellEnv.sync>;

const prepareEnvMock = () =>
	shellEnvMock.mockImplementation(() => ({
		NEXUS_USER: 'user',
		NEXUS_PASSWORD: 'password'
	}));

describe('deployToKubernetes', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		prepareEnvMock();
	});

	it('installs or upgrades new application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const deployDir = path.join(baseCwd, 'deploy');
		const image = createDockerImageTag(buildContext.projectInfo);

		runCommandMock.mockImplementation(() => taskEither.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(4);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm upgrade --install ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
	});

	it('installs or upgrades helm application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'helmReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};

		const deployDir = path.join(baseCwd, 'deploy');

		runCommandMock.mockImplementation(() => taskEither.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(4);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace infra-prod --values ./chart/values.yml `,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm upgrade --install ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace infra-prod --values ./chart/values.yml `,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
	});

	it('installs helm application via helm with secrets', async () => {
		const baseCwd = path.join(
			baseWorkingDir,
			'helmReleaseApplicationWithSecrets'
		);
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};

		const deployDir = path.join(baseCwd, 'deploy');

		runCommandMock.mockImplementation(() => taskEither.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(4);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace infra-prod --values ./chart/values.yml --set theSuperSecret=$SECRET_ENV_VARIABLE`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm upgrade --install ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace infra-prod --values ./chart/values.yml --set theSuperSecret=$SECRET_ENV_VARIABLE`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
	});
});
