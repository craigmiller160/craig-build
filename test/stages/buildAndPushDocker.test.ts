import shellEnv from 'shell-env';
import { runCommandMock } from '../testutils/runCommandMock';
import { getCwdMock } from '../testutils/getCwdMock';
import { createBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { buildAndPushDocker } from '../../src/stages/buildAndPushDocker';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';
import path from 'path';
import { type } from 'os';

jest.mock('shell-env', () => ({
	sync: jest.fn()
}));
jest.mock('os', () => ({
	type: jest.fn()
}));
const osTypeMock = type as jest.Mock;

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
		`${cmdSudo}docker login nexus-docker-craigmiller160.ddns.net -u \${user} -p \${password}`,
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
			`${cmdSudo}docker image ls | grep my-project | grep 1.0.0 | awk '{ print $3 }' | xargs sudo docker image rm -f`,
			{ printOutput: true }
		);
		callCount++;
	}
	expect(runCommandMock).toHaveBeenNthCalledWith(
		callCount,
		`${cmdSudo}docker build --platform amd64 --network=host -t nexus-docker-craigmiller160.ddns.net/my-project:1.0.0 .`,
		{ printOutput: true, cwd: path.join('/root', 'deploy') }
	);
	callCount++;
	expect(runCommandMock).toHaveBeenNthCalledWith(
		callCount,
		`${cmdSudo}docker push nexus-docker-craigmiller160.ddns.net/my-project:1.0.0`,
		{ printOutput: true }
	);
};

describe('buildAndPushDocker', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		runCommandMock.mockImplementation(() => TE.right('a'));
		getCwdMock.mockImplementation(() => '/root');
	});

	it('no docker username environment variable', async () => {
		shellEnvMock.mockImplementation(() => ({
			NEXUS_PASSWORD: 'password'
		}));
		osTypeMock.mockImplementation(() => 'Linux');

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
		shellEnvMock.mockImplementation(() => ({
			NEXUS_USER: 'user'
		}));
		osTypeMock.mockImplementation(() => 'Linux');

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
		osTypeMock.mockImplementation(() => 'Linux');

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
		runCommandMock.mockImplementation(() => TE.right(''));
		prepareEnvMock();
		osTypeMock.mockImplementation(() => 'Linux');

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
		osTypeMock.mockImplementation(() => 'Linux');

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
		osTypeMock.mockImplementation(() => 'Linux');

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
		osTypeMock.mockImplementation(() => 'Linux');

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};

		const result = await buildAndPushDocker.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		validateCommands();
	});

	it('builds and pushes docker image on MacOS', async () => {
		throw new Error();
	});
});
