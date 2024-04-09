import { vi, MockedFunction } from 'vitest';
import os from 'os';

vi.mock('os', () => ({
	default: {
		type: vi.fn(),
		homedir: vi.fn()
	}
}));

export const osMock = {
	type: os.type as MockedFunction<typeof os.type>,
	homedir: os.homedir as MockedFunction<typeof os.homedir>
};
