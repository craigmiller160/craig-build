import * as E from 'fp-ts/Either';
import { PackageJson } from '../../src/configFileTypes/PackageJson';
import { readFile } from '../../src/functions/File';
import { getBuildToolInfo } from '../../src/stages/getBuildToolInfo';
import { createIncompleteBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import * as O from 'fp-ts/Option';

jest.mock('../../src/functions/readFile', () => ({
	readFile: jest.fn()
}));

const readFileMock = readFile as jest.Mock;

const releasePackageJson: PackageJson = {
	name: '@craigmiller160/craig-build',
	version: '1.0.0'
};
const preReleasePackageJson: PackageJson = {
	name: '@craigmiller160/craig-build',
	version: '1.0.0-beta'
};

const buildContext = createIncompleteBuildContext();

describe('getBuildToolInfo', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('gets pre-release info', async () => {
		readFileMock.mockImplementation(() =>
			E.right(JSON.stringify(preReleasePackageJson))
		);
		const result = await getBuildToolInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			buildToolInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0-beta',
				isPreRelease: true
			})
		});
	});

	it('get release info', async () => {
		readFileMock.mockImplementation(() =>
			E.right(JSON.stringify(releasePackageJson))
		);
		const result = await getBuildToolInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			buildToolInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0',
				isPreRelease: false
			})
		});
	});
});
