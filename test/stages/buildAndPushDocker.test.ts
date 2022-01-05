import shellEnv from 'shell-env';
import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { buildAndPushDocker } from '../../src/stages/buildAndPushDocker';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';

jest.mock('shell-env', () => ({
	sync: jest.fn()
}));

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		versionType: VersionType.Release
	}
});

const shellEnvMock = shellEnv.sync as jest.Mock;

const prepareEnvMock = () =>
	shellEnvMock.mockImplementation(() => ({
		NEXUS_DOCKER_USER: 'user',
		NEXUS_DOCKER_PASSWORD: 'password'
	}));

const validateCommands = () => {
	expect(runCommandMock).toHaveBeenCalledTimes(4);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		1,
		'sudo docker login craigmiller160.ddns.net:30004 -u ${user} -p ${password}',
		{ printOutput: true, variables: { user: 'user', password: 'password' } }
	);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		2,
		"sudo docker image ls | grep my-project | grep 1.0.0 | awk '{ print $3 }' | xargs sudo docker image rm -f",
		{ printOutput: true }
	);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		3,
		'sudo docker build --network=host -t craigmiller160.ddns.net:30004/my-project:1.0.0',
		{ printOutput: true }
	);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		4,
		'sudo docker push craigmiller160.ddns.net:30004/my-project:1.0.0',
		{ printOutput: true }
	);
};

describe('buildAndPushDocker', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		runCommandMock.mockImplementation(() => TE.right(''));
	});

	it('no docker username environment variable', async () => {
		shellEnvMock.mockImplementation(() => ({
			NEXUS_DOCKER_PASSWORD: 'password'
		}));

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Missing Docker credential environment variables')
		);
	});

	it('no docker password environment variable', async () => {
		shellEnvMock.mockImplementation(() => ({
			NEXUS_DOCKER_USER: 'user'
		}));

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Missing Docker credential environment variables')
		);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('builds and pushes docker image for maven application', async () => {
		prepareEnvMock();

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});

	it('builds and pushes docker image for npm application', async () => {
		prepareEnvMock();

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

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});
});
