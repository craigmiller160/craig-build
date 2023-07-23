import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import '@relmify/jest-fp-ts';
import { getNpmCommand } from '../../src/context/npmCommandUtils';

const getNpmCommandBaseDir = path.join(
	process.cwd(),
	'test',
	'__getNpmCommand__'
);

describe('npmCommandUtils', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('getNpmCommand', () => {
		it('is npm', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'npm')
			);
			const result = getNpmCommand();
			expect(result).toEqualRight('npm');
		});

		it('is yarn', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'yarn')
			);
			const result = getNpmCommand();
			expect(result).toEqualRight('yarn');
		});

		it('is pnpm', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'pnpm')
			);
			const result = getNpmCommand();
			expect(result).toEqualRight('pnpm');
		});

		it('is unknown', () => {
			getCwdMock.mockImplementation(() => getNpmCommandBaseDir);
			const result = getNpmCommand();
			expect(result).toEqualLeft(
				new Error('Unable to determine the NPM command to use')
			);
		});
	});
});
