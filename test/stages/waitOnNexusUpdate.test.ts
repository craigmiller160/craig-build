import { wait } from '../../src/utils/wait';

jest.mock('../../src/utils/wait', () => ({
	wait: jest.fn()
}));

const waitMock = wait as jest.Mock;

describe('waitOnNexusUpdate', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips for non-application', () => {
		throw new Error();
	});

	it('skips for docker', () => {
		throw new Error();
	});

	it('waits on non-docker application', () => {
		throw new Error();
	});
});
