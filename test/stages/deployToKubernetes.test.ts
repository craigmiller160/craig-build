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

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		isPreRelease: false
	}
});

describe('deployToKubernetes', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		runCommandMock.mockImplementation(() => TE.right(''));
	});

	it('skips for NpmLibrary', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
		expect(getCwdMock).not.toHaveBeenCalled();
	});

	it('skips for MavenLibrary', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenLibrary
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
		expect(getCwdMock).not.toHaveBeenCalled();
	});

	it('skips for DockerImage', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
		expect(getCwdMock).not.toHaveBeenCalled();
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
				cwd: path.join(baseWorkingDir, 'deploy'),
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
				cwd: path.join(baseWorkingDir, 'deploy'),
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
				cwd: path.join(baseWorkingDir, 'deploy'),
				printOutput: true
			}
		);
	});

	it('deploys for MavenApplication with configmap', async () => {
		throw new Error();
	});

	it('deploys for MavenApplication with multiple configmaps', async () => {
		throw new Error();
	});
});
