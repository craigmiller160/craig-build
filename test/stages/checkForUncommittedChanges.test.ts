import { runCommandMock } from '../testutils/runCommandMock';
import * as E from 'fp-ts/Either';
import '@relmify/jest-fp-ts';
import { createBuildContext, createIncompleteBuildContext } from '../testutils/createBuildContext';
import {
	checkForUncommittedChanges,
	GIT_COMMAND
} from '../../src/stages/checkForUncommittedChanges';

const buildContext = createIncompleteBuildContext();

describe('checkForUncommittedChanges', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('uncommitted changes found', async () => {
		runCommandMock.mockImplementation(() => E.right(''));

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});

	it('uncommitted changes not found', async () => {
		runCommandMock.mockImplementation(() => E.right('abc'));

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot run with uncommitted changes')
		);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});
});
