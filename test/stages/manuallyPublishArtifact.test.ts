import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { manuallyPublishArtifact } from '../../src/stages/manuallyPublishArtifact';
import { runCommandMock } from '../testutils/runCommandMock';

const baseBuildContext = createBuildContext();

describe('manuallyPublishArtifact', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips for Maven project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await manuallyPublishArtifact.execute(buildContext)();
		expect(result).toEqual(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('skips for Docker project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication
		};

		const result = await manuallyPublishArtifact.execute(buildContext)();
		expect(result).toEqual(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('publishes NPM project', async () => {
		throw new Error();
	});
});
