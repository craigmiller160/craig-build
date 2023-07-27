import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import '@relmify/jest-fp-ts';
import {
	getNpmBuildTool,
	getNpmBuildToolInstallCommand
} from '../../src/context/npmCommandUtils';

const getNpmCommandBaseDir = path.join(
	process.cwd(),
	'test',
	'__getNpmCommand__'
);

describe('npmCommandUtils', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('getNpmBuildToolInstallCommand', () => {
		it('npm', () => {
			expect(getNpmBuildToolInstallCommand('npm')).toEqual('npm install');
		});

		it('yarn', () => {
			expect(getNpmBuildToolInstallCommand('yarn')).toEqual(
				'yarn install'
			);
		});

		it('pnpm', () => {
			expect(getNpmBuildToolInstallCommand('pnpm')).toEqual(
				'pnpm install'
			);
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
