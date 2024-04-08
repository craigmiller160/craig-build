import { vi, MockedFunction } from 'vitest';
import shellEnv from 'shell-env';

vi.mock('shell-env', () => ({
	default: {
		sync: vi.fn()
	}
}));

export const shellEnvSyncMock = shellEnv.sync as MockedFunction<
	typeof shellEnv.sync
>;
