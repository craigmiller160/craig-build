import { either } from 'fp-ts';
import { PackageJson } from '../../src/configFileTypes/PackageJson';
import { readFile } from '../../src/functions/File';
import { getBuildToolInfo } from '../../src/stages/getBuildToolInfo';
import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { VersionType } from '../../src/context/VersionType';

jest.mock('../../src/functions/File', () => ({
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

const buildContext = createBuildContext();

describe('getBuildToolInfo', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('gets pre-release info', async () => {
		readFileMock.mockImplementation(() =>
			either.right(JSON.stringify(preReleasePackageJson))
		);
		const result = await getBuildToolInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0-beta',
				versionType: VersionType.PreRelease
			}
		});
	});

	it('gets pre-release info with beta number', async () => {
		readFileMock.mockImplementation(() =>
			either.right(
				JSON.stringify({
					...preReleasePackageJson,
					version: '1.0.0-beta.1'
				})
			)
		);
		const result = await getBuildToolInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0-beta.1',
				versionType: VersionType.PreRelease
			}
		});
	});

	it('get release info', async () => {
		readFileMock.mockImplementation(() =>
			either.right(JSON.stringify(releasePackageJson))
		);
		const result = await getBuildToolInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0',
				versionType: VersionType.Release
			}
		});
	});
});
