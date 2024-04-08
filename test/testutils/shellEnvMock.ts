import { vi, MockedFunction } from 'vitest';
import shellEnv from 'shell-env';

vi.mock('shell-env', () => ({
	default: {
		sync: vi.fn()
	}
}));

export const shellEnvMock = {
	sync: vi.fn<
		Parameters<typeof shellEnv.sync>,
		ReturnType<typeof shellEnv.sync>
	>()
};
