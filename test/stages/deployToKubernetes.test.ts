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

const createHelmList = (deploymentName: string): string => `
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
${deploymentName}   apps-prod       1               2022-09-06 16:30:04.728675 -0400 EDT    deployed        email-service-0.1.0     1.0.0      
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

describe('deployToKubernetes', () => {
	beforeEach(() => {
		jest.resetAllMocks();
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

		expect(runCommandMock).toHaveBeenCalledTimes(8);
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
			3,
			'helm dependency build',
			{ printOutput: true, cwd: path.join(deployDir, 'chart') }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm template ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app-deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm package ./chart --version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = `${buildContext.projectInfo.name}-0.1.0.tgz`;
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm install ${deploymentName} ${tarFile} --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app-deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir }
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
			TE.right(createHelmList(deploymentName))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(8);
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
			3,
			'helm dependency build',
			{ printOutput: true, cwd: path.join(deployDir, 'chart') }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm template ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app-deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm package ./chart --version ${buildContext.projectInfo.version}`,
			{ printOutput: true, cwd: deployDir }
		);
		const tarFile = `${buildContext.projectInfo.name}-0.1.0.tgz`;
		expect(runCommandMock).toHaveBeenNthCalledWith(
			6,
			`helm upgrade ${deploymentName} ${tarFile} --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app-deployment.image=${image}`,
			{ printOutput: true, cwd: deployDir }
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
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const deploymentName = 'email-service';
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
			`helm list --kube-context=${K8S_CTX} --namespace ${K8S_NS}`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`kubectl config use-context ${K8S_CTX}`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			'helm dependency build',
			{ printOutput: true, cwd: path.join(deployDir, 'chart') }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm template ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm install ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml`,
			{ printOutput: true, cwd: deployDir }
		);
		throw new Error('What about secrets?');
	});

	it('updates helm application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};

		const deploymentName = 'email-service';
		const deployDir = path.join(baseCwd, 'deploy');

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList(deploymentName))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(5);
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
			3,
			'helm dependency build',
			{ printOutput: true, cwd: path.join(deployDir, 'chart') }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`helm template ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml`,
			{ printOutput: true, cwd: deployDir }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			5,
			`helm upgrade ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml`,
			{ printOutput: true, cwd: deployDir }
		);
		throw new Error('What about secrets?');
	});
});
