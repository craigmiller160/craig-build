import { runCommandMock } from '../testutils/runCommandMock';
import { getCwdMock } from '../testutils/getCwdMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { deployToKubernetes } from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';

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

	it('deploys for MavenApplication', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
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

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
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

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'KUBE_IMG_VERSION=1.0.0 envsubst < deployment.yml | kubectl apply -f -',
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

		expect(runCommandMock).toHaveBeenCalledTimes(2);
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
	});
});
