import { describe, expect, it, vi, beforeEach } from 'vitest';

import { runCommand } from '../../src/command/runCommand';

describe('runCommand', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('test successful command', async () => {
		const result = await runCommand('ls')();
		expect(result).toEqualRight(expect.stringMatching(/.*src.*/));
	});

	it('test failed command', async () => {
		const result = await runCommand('abc')();
		expect(result).toEqualLeft(expect.any(Error));
	});

	it('test command with secrets', async () => {
		const result = await runCommand('ls | grep ${var}', {
			variables: {
				var: 'src'
			}
		})();
		expect(result).toEqualRight('src\n');
	});
});
