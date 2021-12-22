import { createBuildContext } from '../testutils/createBuildContext';
import * as O from 'fp-ts/Option';
import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';
import { searchForNpmReleases } from '../../src/services/NexusRepoApi';
import NexusSearchResult, {
	NexusSearchResultItem
} from '../../old-src/types/NexusSearchResult';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmReleases: jest.fn()
}));

const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;

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
			buildToolInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.1.0',
				isPreRelease: false
			})
		});
		const nexusResult: NexusSearchResult = {
			items: [createNexusItem('1.0.0')]
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
			buildToolInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.1.0',
				isPreRelease: false
			})
		});
		const nexusResult: NexusSearchResult = {
			items: [createNexusItem('1.2.0')]
		};
		searchForNpmReleasesMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const result = await validateBuildToolVersion.execute(buildContext)();
		expect(result).toEqualLeft(new Error('craig-build has a newer release than 1.1.0. Please upgrade this tool.'));

		expect(searchForNpmReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'craig-build'
		);
	});

	it('user allows tool with pre-release version to run', async () => {
		throw new Error();
	});

	it('user does not allow tool with pre-release version to run', async () => {
		throw new Error();
	});
});
