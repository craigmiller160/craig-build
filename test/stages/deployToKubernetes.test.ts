import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { deployToKubernetes } from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';

const baseBuildContext = createBuildContext();

describe('deployToKubernetes', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips for NpmLibrary', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('skips for MavenLibrary', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenLibrary
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('skips for DockerImage', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('deploys for MavenApplication', async () => {
		throw new Error();
	});

	it('deploys for NpmApplication', async () => {
		throw new Error();
	});

	it('deploys for DockerApplication', async () => {
		throw new Error();
	});

	it('deploys for MavenApplication with configmap', async () => {
		throw new Error();
	});

	it('deploys for MavenApplication with multiple configmaps', async () => {
		throw new Error();
	});
});
