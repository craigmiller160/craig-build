import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runCommandMock } from '../testutils/runCommandMock';
import {
	buildArtifact,
	MAVEN_BUILD_CMD,
	NPM_BUILD_CMD
} from '../../src/stages/buildArtifact';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';

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
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(MAVEN_BUILD_CMD, {
			printOutput: true
		});
	});

	it('builds npm artifact', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(NPM_BUILD_CMD, {
			printOutput: true
		});
	});
});
