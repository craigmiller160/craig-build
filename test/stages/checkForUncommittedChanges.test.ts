import { runCommandMock } from '../testutils/runCommandMock';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import { createIncompleteBuildContext } from '../testutils/createBuildContext';
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
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});

	it('uncommitted changes not found', async () => {
		runCommandMock.mockImplementation(() => TE.right('abc'));

		const result = await checkForUncommittedChanges.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot run with uncommitted changes')
		);

		expect(runCommandMock).toHaveBeenCalledWith(GIT_COMMAND);
	});
});
