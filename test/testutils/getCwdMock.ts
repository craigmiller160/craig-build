import { vi, MockedFunction } from 'vitest';
import { getCwd } from '../../src/command/getCwd';

vi.mock('../../src/command/getCwd', () => ({
	getCwd: vi.fn()
}));

export const getCwdMock = getCwd as MockedFunction<typeof getCwd>;
