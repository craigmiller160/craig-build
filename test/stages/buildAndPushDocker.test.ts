import shellEnv from 'shell-env';
import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { buildAndPushDocker } from '../../src/stages/buildAndPushDocker';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';

jest.mock('shell-env', () => ({
	sync: jest.fn()
}));

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		isPreRelease: false
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
		'sudo docker login -u ${USER_NAME} -p ${PASSWORD}',
		{ env: { USER_NAME: 'user', PASSWORD: 'password' } }
	);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		2,
		"sudo docker image ls | grep my-project | grep 1.0.0 | awk '{ print $3 }' | xargs sudo docker image rm -f"
	);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		3,
		'sudo docker build --network=host -t craigmiller160.ddns.net:30004/my-project:1.0.0'
	);
	expect(runCommandMock).toHaveBeenNthCalledWith(
		4,
		'sudo docker push craigmiller160.ddns.net:3004/my-project:1.0.0'
	);
};

describe('buildAndPushDocker', () => {
	beforeEach(() => {
		jest.resetAllMocks();
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
		expect(result).toEqualLeft(new Error());
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
		expect(result).toEqualLeft(new Error());

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('skips for npm library', async () => {
		prepareEnvMock();

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('skips for maven library', async () => {
		prepareEnvMock();

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenLibrary
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

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
		throw new Error();
	});

	it('builds and pushes docker image for docker application', async () => {
		throw new Error();
	});

	it('builds and pushes docker image for docker image', async () => {
		throw new Error();
	});
});
