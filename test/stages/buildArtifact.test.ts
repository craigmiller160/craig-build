import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { buildArtifact } from '../../src/stages/buildArtifact';
import '@relmify/jest-fp-ts';
import { runCommandMock } from '../testutils/runCommandMock';

const baseBuildContext = createBuildContext();

describe('buildArtifact', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips docker projects', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('builds maven artifact', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith('mvn clean deploy');
	});

	it('builds npm artifact', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith('yarn build');
	});
});
