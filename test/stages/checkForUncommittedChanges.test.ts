import { runCommandMock } from '../testutils/runCommandMock';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import {
	checkForUncommittedChanges,
	GIT_COMMAND
} from '../../src/stages/checkForUncommittedChanges';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { CommandType } from '../../src/context/CommandType';

const baseBuildContext = createBuildContext();

describe('checkForUncommittedChanges', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('uncommitted changes found for FullBuild build', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.FullBuild
			}
		};

		const result = await checkForUncommittedChanges.execute(
			baseBuildContext
		)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});

	it('uncommitted changes found for DockerOnly build', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.DockerOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(
			baseBuildContext
		)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});

	it('uncommitted changes not found', async () => {
		runCommandMock.mockImplementation(() => TE.right('abc'));

		const result = await checkForUncommittedChanges.execute(
			baseBuildContext
		)();
		expect(result).toEqualLeft(
			new Error('Cannot run with uncommitted changes')
		);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});

	it('uncommitted changes found for KubernetesOnly build', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.KubernetesOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(
			baseBuildContext
		)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		throw new Error();
	});

	it('uncommitted changes found for TerraformOnly build', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				...baseBuildContext.commandInfo,
				type: CommandType.TerraformOnly
			}
		};

		const result = await checkForUncommittedChanges.execute(
			baseBuildContext
		)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
		throw new Error();
	});
});
