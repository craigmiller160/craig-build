import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';
import { searchForNpmReleases } from '../../src/services/NexusRepoApi';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import '@relmify/jest-fp-ts';
import { readUserInput } from '../../src/utils/readUserInput';
import { createBuildContext } from '../testutils/createBuildContext';
import { VersionType } from '../../src/context/VersionType';
import {
	NexusSearchResult,
	NexusSearchResultItem
} from '../../src/services/NexusSearchResult';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmReleases: jest.fn()
}));
jest.mock('../../src/utils/readUserInput', () => ({
	readUserInput: jest.fn()
}));

const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;
const readUserInputMock = readUserInput as jest.Mock;

const createNexusItem = (version: string): NexusSearchResultItem => ({
	name: '',
	version,
	repository: '',
	group: '',
	format: '',
	id: '',
	assets: []
});

describe('validateBuildToolVersion', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('tool version is highest release version', async () => {
		const buildContext = createBuildContext({
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.1.0',
				versionType: VersionType.Release
			}
		});
		const nexusResult: NexusSearchResult = {
			items: [createNexusItem('1.0.0'), createNexusItem('1.1.0')]
		};
		searchForNpmReleasesMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const result = await validateBuildToolVersion.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(searchForNpmReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'craig-build'
		);
	});

	it('tool version is not highest release version', async () => {
		const buildContext = createBuildContext({
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.1.0',
				versionType: VersionType.Release
			}
		});
		const nexusResult: NexusSearchResult = {
			items: [createNexusItem('1.2.0'), createNexusItem('1.1.0')]
		};
		searchForNpmReleasesMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const result = await validateBuildToolVersion.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error(
				'craig-build has a newer release than 1.1.0. Please upgrade this tool.'
			)
		);

		expect(searchForNpmReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'craig-build'
		);
	});

	it('user allows tool with pre-release version to run', async () => {
		const buildContext = createBuildContext({
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0-beta',
				versionType: VersionType.PreRelease
			}
		});
		readUserInputMock.mockImplementation(() => T.of('y'));
		const result = await validateBuildToolVersion.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalled();
	});

	it('user does not allow tool with pre-release version to run', async () => {
		const buildContext = createBuildContext({
			buildToolInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0-beta',
				versionType: VersionType.PreRelease
			}
		});
		readUserInputMock.mockImplementation(() => T.of('n'));
		const result = await validateBuildToolVersion.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('User aborted craig-build pre-release execution.')
		);

		expect(readUserInputMock).toHaveBeenCalled();
	});
});
