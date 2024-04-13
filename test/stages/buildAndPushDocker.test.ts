import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runCommandMock } from '../testutils/runCommandMock';
import { getCwdMock } from '../testutils/getCwdMock';
import { shellEnvMock } from '../testutils/shellEnvMock';
import { osMock } from '../testutils/osMock';
import { createBuildContext } from '../testutils/createBuildContext';

import { buildAndPushDocker } from '../../src/stages/buildAndPushDocker';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { taskEither } from 'fp-ts';
import { VersionType } from '../../src/context/VersionType';
import path from 'path';

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		versionType: VersionType.Release,
		repoType: 'polyrepo'
	}
});

const prepareEnvMock = () =>
	shellEnvMock.sync.mockImplementation(() => ({
		NEXUS_USER: 'user',
		NEXUS_PASSWORD: 'password'
	}));

type ValidateCommandsArgs = {
	readonly numCommands: number;
	readonly useSudo: boolean;
};
const validateCommands = ({
	numCommands = 5,
	useSudo = true
}: Partial<ValidateCommandsArgs> = {}) => {
	expect(runCommandMock).toHaveBeenCalledTimes(numCommands);
	let callCount = 1;
	const cmdSudo = useSudo ? 'sudo ' : '';
	expect(runCommandMock).toHaveBeenNthCalledWith(
		callCount,
		`${cmdSudo}docker login nexus-docker.craigmiller160.us -u \${user} -p \${password}`,
		{ printOutput: true, variables: { user: 'user', password: 'password' } }
	);
	callCount++;
	expect(runCommandMock).toHaveBeenNthCalledWith(
		callCount,
		`${cmdSudo}docker image ls | grep my-project | grep 1.0.0 || true`,
		{ printOutput: true }
	);
	callCount++;
	if (numCommands === 5) {
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			`${cmdSudo}docker image ls | grep my-project | grep 1.0.0 | awk '{ print $3 }' | xargs ${cmdSudo}docker image rm -f`,
			{ printOutput: true }
		);
		callCount++;
	}
	expect(runCommandMock).toHaveBeenNthCalledWith(
		callCount,
		`${cmdSudo}docker build --platform linux/amd64 --network=host -t nexus-docker.craigmiller160.us/my-project:1.0.0 .`,
		{ printOutput: true, cwd: path.join('/root', 'deploy') }
	);
	callCount++;
	expect(runCommandMock).toHaveBeenNthCalledWith(
		callCount,
		`${cmdSudo}docker push nexus-docker.craigmiller160.us/my-project:1.0.0`,
		{ printOutput: true }
	);
};

describe('buildAndPushDocker', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		runCommandMock.mockImplementation(() => taskEither.right('a'));
		getCwdMock.mockImplementation(() => '/root');
	});

	it('no docker username environment variable', async () => {
		shellEnvMock.sync.mockImplementation(() => ({
			NEXUS_PASSWORD: 'password'
		}));
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Missing Nexus credential environment variables')
		);
	});

	it('no docker password environment variable', async () => {
		shellEnvMock.sync.mockImplementation(() => ({
			NEXUS_USER: 'user'
		}));
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Missing Nexus credential environment variables')
		);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('builds and pushes docker image for maven application', async () => {
		prepareEnvMock();
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});

	it('builds and pushes docker image for maven application, with no existing images', async () => {
		runCommandMock.mockReset();
		runCommandMock.mockImplementation(() => taskEither.right(''));
		prepareEnvMock();
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands({ numCommands: 4 });
	});

	it('builds and pushes docker image for npm application', async () => {
		prepareEnvMock();
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});

	it('builds and pushes docker image for docker application', async () => {
		prepareEnvMock();
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});

	it('builds and pushes docker image for docker image', async () => {
		prepareEnvMock();
		osMock.type.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});

	it('builds and pushes docker image on MacOS', async () => {
		prepareEnvMock();
		osMock.type.mockImplementation(() => 'Darwin');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands({ useSudo: false });
	});
});
