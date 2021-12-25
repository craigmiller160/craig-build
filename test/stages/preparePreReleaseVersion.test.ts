import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import '@relmify/jest-fp-ts';
import { preparePreReleaseVersion } from '../../src/stages/preparePreReleaseVersion';
import {
	searchForDockerBetas,
	searchForMavenSnapshots,
	searchForNpmBetas
} from '../../src/services/NexusRepoApi';
import {
	NexusSearchResult,
	NexusSearchResultItem
} from '../../src/services/NexusSearchResult';
import { ProjectType } from '../../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmBetas: jest.fn(),
	searchForMavenSnapshots: jest.fn(),
	searchForDockerBetas: jest.fn()
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
	version,
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
		const version = '1.0.0-SNAPSHOT-20210101-2222';
		const nexusResult: NexusSearchResult = {
			items: [createItem(version)]
		};
		searchForMavenSnapshotsMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'io.craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-SNAPSHOT'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version
			}
		});

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(
			'io.craigmiller160',
			'my-project'
		);
		throw new Error();
	});

	it('cannot find recently created Maven pre-release artifact version', async () => {
		throw new Error();
	});

	it('prepares pre-release version for Docker project based on existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication,
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

		expect(searchForDockerBetasMock).toHaveBeenCalledWith('my-project');
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for Docker project with no existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.1.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication,
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

		expect(searchForDockerBetasMock).toHaveBeenCalledWith('my-project');
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});
});
