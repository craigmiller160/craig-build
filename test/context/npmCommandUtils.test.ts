import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import '@relmify/jest-fp-ts';
import { getNpmBuildTool } from '../../src/context/npmCommandUtils';

const getNpmCommandBaseDir = path.join(
	process.cwd(),
	'test',
	'__getNpmCommand__'
);

describe('npmCommandUtils', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('getNpmBuildCommand', () => {
		it('for npm', () => {
			throw new Error();
		});

		it('for yarn', () => {
			throw new Error();
		});

		it('for pnpm', () => {
			throw new Error();
		});
	});

	describe('getNpmPublishCommand', () => {
		it('for npm', () => {
			throw new Error();
		});

		it('for yarn', () => {
			throw new Error();
		});

		it('for pnpm', () => {
			throw new Error();
		});
	});

	describe('getNpmBuildTool', () => {
		it('is npm', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'npm')
			);
			const result = getNpmBuildTool();
			expect(result).toEqualRight('npm');
		});

		it('is yarn', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'yarn')
			);
			const result = getNpmBuildTool();
			expect(result).toEqualRight('yarn');
		});

		it('is pnpm', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'pnpm')
			);
			const result = getNpmBuildTool();
			expect(result).toEqualRight('pnpm');
		});

		it('is unknown', () => {
			getCwdMock.mockImplementation(() => getNpmCommandBaseDir);
			const result = getNpmBuildTool();
			expect(result).toEqualLeft(
				new Error('Unable to determine the NPM command to use')
			);
		});
	});
});
