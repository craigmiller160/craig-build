import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';

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
			throw new Error();
		});

		it('is yarn', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'yarn')
			);
			throw new Error();
		});

		it('is pnpm', () => {
			getCwdMock.mockImplementation(() =>
				path.join(getNpmCommandBaseDir, 'yarn')
			);
			throw new Error();
		});

		it('is unknown', () => {
			getCwdMock.mockImplementation(() => getNpmCommandBaseDir);
			throw new Error();
		});
	});
});
