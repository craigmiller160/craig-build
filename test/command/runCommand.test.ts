import '@relmify/jest-fp-ts';
import { runCommand } from '../../src/command/runCommand';

describe('runCommand', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('test successful command', async () => {
		const result = await runCommand('ls')();
		expect(result).toEqualRight(expect.stringMatching(/^build.*/));
	});

	it('test failed command', async () => {
		const result = await runCommand('abc')();
		expect(result).toEqualLeft(expect.any(Error));
	});
});
