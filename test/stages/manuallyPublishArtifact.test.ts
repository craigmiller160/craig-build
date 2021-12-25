import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runCommandMock } from '../testutils/runCommandMock';
import {
	CLEAR_FILES_COMMAND,
	manuallyPublishArtifact
} from '../../src/stages/manuallyPublishArtifact';
import * as TE from 'fp-ts/TaskEither';
import { NPM_PUBLISH_COMMAND } from '../../old-src/stages/createArtifact/tasks/publish';

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
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('skips for Docker project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication
		};

		const result = await manuallyPublishArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('publishes NPM project', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.0.0'
			}
		};

		const result = await manuallyPublishArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`${NPM_PUBLISH_COMMAND} 1.0.0`,
			{ printOutput: true }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(2, CLEAR_FILES_COMMAND);
	});
});
