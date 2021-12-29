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
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import path from 'path';
import { homedir } from 'os';
import { VersionType } from '../../src/context/VersionType';
import { CommandType } from '../../src/context/CommandType';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmBetas: jest.fn(),
	searchForDockerBetas: jest.fn(),
	searchForMavenSnapshots: jest.fn()
}));

jest.mock('os', () => ({
	homedir: jest.fn()
}));

const baseBuildContext = createBuildContext();

const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForDockerBetasMock = searchForDockerBetas as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;
const homedirMock = homedir as jest.Mock;

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

	it('full build, prepares pre-release version for NPM project based on existing version', async () => {
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
				versionType: VersionType.PreRelease,
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
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('full build, prepares pre-release version for NPM project with no existing version', async () => {
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
				versionType: VersionType.PreRelease,
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
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('full build, looks up recently created maven pre-release version from .m2', async () => {
		homedirMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenPreReleaseInfoM2')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'io.craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.1.0-SNAPSHOT'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.1.0-20211225.003019-1'
			}
		});

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('not full build, grabs pre-release version for NPM project from Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() => TE.right(nexusResult));

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.DockerOnly
			},
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.2'
			}
		});

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('not full build, cannot find pre-release version for NPM project in Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: []
		};
		searchForNpmBetasMock.mockImplementation(() => TE.right(nexusResult));

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.DockerOnly
			},
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualLeft(new Error());

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('not full build, grabs pre-release version for Maven project from Nexus', async () => {
		searchForMavenSnapshotsMock.mockImplementation(() =>
			TE.right({ items: [createItem('1.1.0-20211225.003019-1')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.DockerOnly
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'io.craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.1.0-SNAPSHOT'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.1.0-20211225.003019-1'
			}
		});

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(
			'io.craigmiller160',
			'my-project',
			'1.1.0-*'
		);
	});

	it('not full build, cannot find pre-release version for Maven project in Nexus', async () => {
		searchForMavenSnapshotsMock.mockImplementation(() =>
			TE.right({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.DockerOnly
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'io.craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.1.0-SNAPSHOT'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualLeft(new Error('No matching Maven pre-release versions in Nexus'));

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(
			'io.craigmiller160',
			'my-project',
			'1.1.0-*'
		);
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
				versionType: VersionType.PreRelease,
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

		expect(searchForDockerBetasMock).toHaveBeenCalledWith(
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
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
				versionType: VersionType.PreRelease,
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

		expect(searchForDockerBetasMock).toHaveBeenCalledWith(
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('kubernetes only, grabs existing pre-release version for Docker project from Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.2'
			}
		});

		expect(searchForDockerBetasMock).toHaveBeenCalledWith(
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('kubernetes only, cannot find existing pre-release version for Docker project in Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: []
		};
		searchForDockerBetasMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualLeft(new Error());

		expect(searchForDockerBetasMock).toHaveBeenCalledWith(
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});
});
