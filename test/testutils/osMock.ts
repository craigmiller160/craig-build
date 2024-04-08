import { vi, MockedFunction } from 'vitest';
import os from 'os';

vi.mock('os', () => ({
	type: vi.fn()
}));

export const osMock = {
	type: os.type as MockedFunction<typeof os.type>
};
