import { getCwdMock } from '../testutils/getCwdMock';
import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import {
	deployToKubernetes,
	K8S_CTX,
	K8S_NS
} from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';
import { BuildContext } from '../../src/context/BuildContext';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { ProjectType } from '../../src/context/ProjectType';
import path from 'path';
import { createDockerImageTag } from '../../src/utils/dockerUtils';
import shellEnv from 'shell-env';

const createHelmList = (projectName: string): string => `
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
${projectName}   apps-prod       1               2022-09-06 16:30:04.728675 -0400 EDT    deployed        email-service-0.1.0     1.0.0      
ingress         apps-prod       1               2022-09-05 17:01:57.090562 -0400 EDT    deployed        ingress-0.1.0           1.0.0
`;

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		versionType: VersionType.Release
	}
});

jest.mock('shell-env', () => ({
	sync: jest.fn()
}));

const shellEnvMock = shellEnv.sync as jest.Mock;

const prepareEnvMock = () =>
	shellEnvMock.mockImplementation(() => ({
		NEXUS_USER: 'user',
		NEXUS_PASSWORD: 'password'
	}));

describe('deployToKubernetes', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		prepareEnvMock();
	});

	it('installs new application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const deploymentName = 'email-service';
		const deployDir = path.join(baseCwd, 'deploy');
		const image = createDockerImageTag(buildContext.projectInfo);

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList('abcdefg'))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(7);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm list --kube-context=${K8S_CTX} --namespace ${K8S_NS}`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir, env: expect.anything() }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm install ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			7,
			`kubectl rollout restart deployment ${deploymentName} -n ${K8S_NS}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			8,
			`kubectl rollout status deployment ${deploymentName} -n ${K8S_NS}`,
			{ printOutput: true, cwd: deployDir }
		);
	});

	it('upgrades existing application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const deploymentName = 'email-service';
		const deployDir = path.join(baseCwd, 'deploy');
		const image = createDockerImageTag(buildContext.projectInfo);

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList(buildContext.projectInfo.name))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(7);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm list --kube-context=${K8S_CTX} --namespace ${K8S_NS}`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm upgrade ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			7,
			`kubectl rollout restart deployment ${deploymentName} -n ${K8S_NS}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			8,
			`kubectl rollout status deployment ${deploymentName} -n ${K8S_NS}`,
			{ printOutput: true, cwd: deployDir }
		);
	});

	it('installs helm application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'helmReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};

		const deployDir = path.join(baseCwd, 'deploy');

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList('abcdefg'))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(5);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm list --kube-context=${K8S_CTX} --namespace infra-prod`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace infra-prod --values ./chart/values.yml `,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm install ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace infra-prod --values ./chart/values.yml `,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
	});

	it('updates helm application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'helmReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};

		const deployDir = path.join(baseCwd, 'deploy');

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList(buildContext.projectInfo.name))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(5);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm list --kube-context=${K8S_CTX} --namespace infra-prod`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace infra-prod --values ./chart/values.yml `,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm upgrade ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace infra-prod --values ./chart/values.yml `,
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

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList('abcdefg'))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(5);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm list --kube-context=${K8S_CTX} --namespace infra-prod`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm package ./chart --version ${buildContext.projectInfo.version} --app-version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = path.join(
			deployDir,
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm template ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace infra-prod --values ./chart/values.yml --set theSuperSecret=$SECRET_ENV_VARIABLE`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm install ${buildContext.projectInfo.name} ${tarFile} --kube-context=${K8S_CTX} --namespace infra-prod --values ./chart/values.yml --set theSuperSecret=$SECRET_ENV_VARIABLE`,
			{ printOutput: true, cwd: deployDir, env: expect.any(Object) }
		);
	});
});
