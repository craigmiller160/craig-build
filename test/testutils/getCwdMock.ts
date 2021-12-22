import { getCwd } from '../../src/command/getCwd';

jest.mock('../../src/command/getCwd', () => ({
	getCwd: jest.fn()
}));

export const getCwdMock = getCwd as jest.Mock;
