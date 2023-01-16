import { runCommandMock } from '../testutils/runCommandMock';
import * as TaskEither from 'fp-ts/TaskEither';
import * as Task from 'fp-ts/Task';
import '@relmify/jest-fp-ts';
import {
	checkForUncommittedChanges,
	GIT_COMMAND
} from '../../src/stages/checkForUncommittedChanges';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { CommandType } from '../../src/context/CommandType';
import { readUserInput } from '../../src/utils/readUserInput';

const baseBuildContext = createBuildContext();
jest.mock('../../src/utils/readUserInput', () => ({
	readUserInput: jest.fn()
}));
const readUserInputMock = readUserInput as jest.Mock;

describe('checkForUncommittedChanges', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('uncommitted changes found for FullBuild build', async () => {
		runCommandMock.mockImplementation(() => TaskEither.right('abc'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.FullBuild
			}
		};

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot run with uncommitted changes')
		);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		expect(readUserInputMock).not.toHaveBeenCalled();
	});

	it('uncommitted changes found for DockerOnly build', async () => {
		runCommandMock.mockImplementation(() => TaskEither.right('abc'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.DockerOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot run with uncommitted changes')
		);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		expect(readUserInputMock).not.toHaveBeenCalled();
	});

	it('uncommitted changes not found', async () => {
		runCommandMock.mockImplementation(() => TaskEither.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.DockerOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		expect(readUserInputMock).not.toHaveBeenCalled();
	});

	it('uncommitted changes found for KubernetesOnly build, approve to proceed', async () => {
		runCommandMock.mockImplementation(() => TaskEither.right('abc'));
		readUserInputMock.mockImplementation(() => Task.of('y'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.KubernetesOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		expect(readUserInputMock).toHaveBeenCalledWith(
			'Uncommitted changes found, do you want to proceed? (y/n): '
		);
	});

	it('uncommitted changes found for TerraformOnly build, approve to proceed', async () => {
		runCommandMock.mockImplementation(() => TaskEither.right('abc'));
		readUserInputMock.mockImplementation(() => Task.of('y'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.TerraformOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		expect(readUserInputMock).toHaveBeenCalledWith(
			'Uncommitted changes found, do you want to proceed? (y/n): '
		);
	});

	it('uncommitted changes found for TerraformOnly build, deny to proceed', async () => {
		runCommandMock.mockImplementation(() => TaskEither.right('abc'));
		readUserInputMock.mockImplementation(() => Task.of('n'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.TerraformOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot run with uncommitted changes')
		);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		expect(readUserInputMock).toHaveBeenCalledWith(
			'Uncommitted changes found, do you want to proceed? (y/n): '
		);
	});
});
