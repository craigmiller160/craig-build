import { getCwdMock } from '../testutils/getCwdMock';
import { runCommandMock } from '../testutils/runCommandMock';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { BuildContext } from '../../src/context/BuildContext';
import { createBuildContext } from '../testutils/createBuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runTerraformScript } from '../../src/stages/runTerraformScript';
import '@relmify/jest-fp-ts';
import { readUserInput } from '../../src/utils/readUserInput';
import * as Task from 'fp-ts/Task';
import * as TaskEither from 'fp-ts/TaskEither';
import shellEnv from 'shell-env';

jest.mock('../../src/utils/readUserInput', () => ({
	readUserInput: jest.fn()
}));
const readUserInputMock = readUserInput as jest.Mock;

jest.mock('shell-env', () => ({
	sync: jest.fn()
}));
const shellEnvMock = shellEnv.sync as jest.Mock;
const prepareEnvMock = () =>
	shellEnvMock.mockImplementation(() => ({
		NEXUS_USER: 'user',
		NEXUS_PASSWORD: 'password'
	}));

describe('runTerraformScript', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes the terraform script', async () => {
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraform'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => Task.of('y'));
		runCommandMock.mockImplementation(() => TaskEither.right(''));
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(1);
		expect(readUserInputMock).toHaveBeenNthCalledWith(
			1,
			'Do you want to execute the terraform script? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'terraform apply ', {
			printOutput: true,
			cwd: path.join(workingDir, 'deploy', 'terraform')
		});
	});

	it('skips terraform execution if user chooses', async () => {
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraform'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => 'n');
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(1);
		expect(readUserInputMock).toHaveBeenNthCalledWith(
			1,
			'Do you want to execute the terraform script? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledTimes(0);
	});

	it('executes the terraform script with secret variables', async () => {
		prepareEnvMock();
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraformAndSecrets'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => Task.of('y'));
		runCommandMock.mockImplementation(() => TaskEither.right(''));
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(1);
		expect(readUserInputMock).toHaveBeenNthCalledWith(
			1,
			'Do you want to execute the terraform script? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'terraform apply -var=variable_one=$THE_VALUE',
			{
				printOutput: true,
				cwd: path.join(workingDir, 'deploy', 'terraform'),
				env: expect.any(Object)
			}
		);
	});
});
