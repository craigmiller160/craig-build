import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import '@relmify/jest-fp-ts';
import { preparePreReleaseVersion } from '../../src/stages/preparePreReleaseVersion';
import {
	searchForDockerBetas,
	searchForMavenSnapshots,
	searchForNpmBetas
} from '../../src/services/NexusRepoApi';
import NexusSearchResult, {
	NexusSearchResultItem
} from '../../old-src/types/NexusSearchResult';
import { ProjectType } from '../../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmBetas: jest.fn(),
	searchForDockerReleases: jest.fn()
}));

const baseBuildContext = createBuildContext();

const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForDockerBetasMock = searchForDockerBetas as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;

const createItem = (version: string): NexusSearchResultItem => ({
	name: '',
	group: '',
	format: '',
	repository: '',
	version: '',
	id: '',
	assets: []
});

describe('preparePreReleaseVersion', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips for release project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: false
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for NPM project based on existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() => TE.right(nexusResult));

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.3'
			}
		});

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for NPM project with no existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.1.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() => TE.right(nexusResult));

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.1'
			}
		});

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('grabs recently created Maven pre-release artifact version', async () => {
		throw new Error();
	});

	it('prepares pre-release version for Docker project', async () => {
		throw new Error();
	});

	it('prepares pre-release version for Docker project with no existing version', async () => {
		throw new Error();
	});
});
