import { runCommandMock } from '../testutils/runCommandMock';

describe('checkForUncommittedChanges', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('uncommitted changes found', () => {
		throw new Error();
	});

	it('uncommitted changes not found', () => {
		throw new Error();
	});
});
