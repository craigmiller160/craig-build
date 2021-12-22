import { runCommand } from '../../src/command/runCommand';

jest.mock('../../src/command/runCommand', () => ({
	runCommand: jest.fn()
}));

export const runCommandMock = runCommand as jest.Mock;
