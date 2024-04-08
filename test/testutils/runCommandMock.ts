import { vi, MockedFunction } from 'vitest';
import { runCommand } from '../../src/command/runCommand';

vi.mock('../../src/command/runCommand', () => ({
	runCommand: vi.fn()
}));

export const runCommandMock = runCommand as MockedFunction<typeof runCommand>;
