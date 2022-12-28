import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runCommandMock } from '../testutils/runCommandMock';
import { getCwdMock } from '../testutils/getCwdMock';
import {
	CLEAR_FILES_COMMAND,
	manuallyPublishArtifact
} from '../../src/stages/manuallyPublishArtifact';
import * as TE from 'fp-ts/TaskEither';
import { NPM_PUBLISH_COMMAND } from '../../src/stages/manuallyPublishArtifact';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';

const baseBuildContext = createBuildContext();

describe('manuallyPublishArtifact', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('publishes NPM project', async () => {
		const projectPath = path.join(baseWorkingDir, 'npmReleaseApplication');
		getCwdMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'npmReleaseApplication')
		);
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
			{ printOutput: true, cwd: projectPath }
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(2, CLEAR_FILES_COMMAND);
	});

	it('publishes NPM project with publishDirectory', async () => {
		const projectPath = path.join(
			baseWorkingDir,
			'npmReleaseApplicationWithPublishDir'
		);
		getCwdMock.mockImplementation(() => projectPath);
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
			{
				printOutput: true,
				cwd: path.join(projectPath, 'lib')
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(2, CLEAR_FILES_COMMAND);
	});

	it('publishes HelmLibrary project', async () => {
		const projectPath = path.join(baseWorkingDir, 'helmReleaseLibrary');
		getCwdMock.mockImplementation(() => projectPath);
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmLibrary,
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
			'helm package ./chart',
			{
				printOutput: true,
				cwd: path.join(projectPath, 'deploy')
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'curl -v -u USER:PASSWORD https://nexus-craigmiller160.ddns.net/repository/helm-private/ --upload-file chart.tgz',
			{
				printOutput: true,
				cwd: path.join(projectPath, 'deploy')
			}
		);
	});
});
