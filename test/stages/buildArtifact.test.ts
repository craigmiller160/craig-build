import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runCommandMock } from '../testutils/runCommandMock';
import {
	buildArtifact,
	GRADLE_BUILD_COMMAND,
	MAVEN_BUILD_CMD,
	NPM_BUILD_CMD
} from '../../src/stages/buildArtifact';
import '@relmify/jest-fp-ts';
import { taskEither } from 'fp-ts';

const baseBuildContext = createBuildContext();

describe('buildArtifact', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('builds maven artifact', async () => {
		runCommandMock.mockImplementation(() => taskEither.right(''));
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
		runCommandMock.mockImplementation(() => taskEither.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				npmBuildTool: 'npm'
			}
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);

		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'npm install', {
			printOutput: true
		});
		expect(runCommandMock).toHaveBeenNthCalledWith(2, NPM_BUILD_CMD, {
			printOutput: true
		});
	});

	it('builds gradle artifact', async () => {
		runCommandMock.mockImplementation(() => taskEither.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication
		};

		const result = await buildArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GRADLE_BUILD_COMMAND, {
			printOutput: true
		});
	});
});
