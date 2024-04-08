import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runCommandMock } from '../testutils/runCommandMock';
import { getCwdMock } from '../testutils/getCwdMock';
import {
	CLEAR_FILES_COMMAND,
	manuallyPublishArtifact
} from '../../src/stages/manuallyPublishArtifact';
import { taskEither } from 'fp-ts';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { shellEnvSyncMock } from '../testutils/shellEnvMock';

const prepareEnvMock = () =>
	shellEnvSyncMock.mockImplementation(() => ({
		NEXUS_USER: 'user',
		NEXUS_PASSWORD: 'password'
	}));

const baseBuildContext = createBuildContext();

describe('manuallyPublishArtifact', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('publishes NPM project', async () => {
		const projectPath = path.join(baseWorkingDir, 'npmReleaseApplication');
		getCwdMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'npmReleaseApplication')
		);
		runCommandMock.mockImplementation(() => taskEither.right(''));
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
			'npm version --allow-same-version --no-git-tag-version 1.0.0 && npm publish',
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
		runCommandMock.mockImplementation(() => taskEither.right(''));
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
			'npm version --allow-same-version --no-git-tag-version 1.0.0 && npm publish',
			{
				printOutput: true,
				cwd: path.join(projectPath, 'lib')
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(2, CLEAR_FILES_COMMAND);
	});

	it('publishes HelmLibrary project', async () => {
		prepareEnvMock();
		const projectPath = path.join(baseWorkingDir, 'helmReleaseLibrary');
		getCwdMock.mockImplementation(() => projectPath);
		runCommandMock.mockImplementation(() => taskEither.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmLibrary,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '2.0.0'
			}
		};

		const result = await manuallyPublishArtifact.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm package ./chart --version ${buildContext.projectInfo.version}`,
			{
				printOutput: true,
				cwd: path.join(projectPath, 'deploy')
			}
		);
		const tarFile = path.join(
			projectPath,
			'deploy',
			`${buildContext.projectInfo.name}-${buildContext.projectInfo.version}.tgz`
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`curl -v -u user:password https://nexus.craigmiller160.us/repository/helm-private/ --upload-file ${tarFile}`,
			{
				printOutput: true,
				cwd: path.join(projectPath, 'deploy')
			}
		);
	});
});
