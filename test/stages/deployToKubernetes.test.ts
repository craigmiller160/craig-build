import { runCommandMock } from '../testutils/runCommandMock';
import { getCwdMock } from '../testutils/getCwdMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import {
	deployToKubernetes,
	isDeploymentInstalled
} from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';

const helmList = `
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
email-service   apps-prod       1               2022-09-06 16:30:04.728675 -0400 EDT    deployed        email-service-0.1.0     1.0.0      
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
		runCommandMock.mockImplementation(() => TE.right(''));
	});

	// TODO delete this test
	it('delete this test', () => {
		const result = isDeploymentInstalled('email-service')(helmList);
		expect(result).toEqual(true);
	});

	it('deploys for MavenApplication', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'kubectl rollout restart deployment email-service',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
	});

	it('deploys for NpmApplication', async () => {
		const baseCwd = path.join(baseWorkingDir, 'npmReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'kubectl rollout restart deployment email-service',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
	});

	it('deploys for DockerApplication', async () => {
		const baseCwd = path.join(baseWorkingDir, 'dockerReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'kubectl rollout restart deployment email-service',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
	});

	it('deploys for MavenApplication with configmap', async () => {
		const baseCwd = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationOneConfigmap'
		);
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(3);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'kubectl apply -f one.configmap.yml',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			'kubectl rollout restart deployment email-service',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
	});

	it('deploys for MavenApplication with multiple configmaps', async () => {
		const baseCwd = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationTwoConfigmaps'
		);
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(4);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'kubectl apply -f one.configmap.yml',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'kubectl apply -f two.configmap.yml',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			'kubectl rollout restart deployment email-service',
			{
				cwd: path.join(baseCwd, 'deploy'),
				printOutput: true
			}
		);
	});
});
