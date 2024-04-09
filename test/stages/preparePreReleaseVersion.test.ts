import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { osMock } from '../testutils/osMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';

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
import { taskEither } from 'fp-ts';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import path from 'path';
import { VersionType } from '../../src/context/VersionType';
import { CommandType } from '../../src/context/CommandType';

vi.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmBetas: vi.fn(),
	searchForDockerBetas: vi.fn(),
	searchForMavenSnapshots: vi.fn()
}));

const baseBuildContext = createBuildContext();

const searchForNpmBetasMock = searchForNpmBetas as MockedFunction<
	typeof searchForNpmBetas
>;
const searchForDockerBetasMock = searchForDockerBetas as MockedFunction<
	typeof searchForDockerBetas
>;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as MockedFunction<
	typeof searchForMavenSnapshots
>;

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
		vi.resetAllMocks();
	});

	it('full build, prepares pre-release version for NPM project based on existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
		);

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
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('full build, prepares pre-release version for NPM project with no existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.1.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
		);

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
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('full build, looks up recently created maven pre-release version from .m2', async () => {
		osMock.homedir.mockImplementation(() =>
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
		searchForNpmBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
		);

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
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('not full build, cannot find pre-release version for NPM project in Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: []
		};
		searchForNpmBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
		);

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
		expect(result).toEqualLeft(
			new Error('No matching NPM pre-release versions in Nexus')
		);

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('not full build, grabs pre-release version for Maven project from Nexus', async () => {
		searchForMavenSnapshotsMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.1.0-20211225.003019-1')] })
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

	it('not full build, grabs pre-release version for Gradle project in Nexus', async () => {
		searchForMavenSnapshotsMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.1.0-20211225.003019-1')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: CommandType.DockerOnly
			},
			projectType: ProjectType.GradleApplication,
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

	it('is full build, grabs pre-release version for Gradle project in Nexus', async () => {
		searchForMavenSnapshotsMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.1.0-20211225.003019-1')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
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
			taskEither.right({ items: [] })
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
		expect(result).toEqualLeft(
			new Error('No matching Maven pre-release versions in Nexus')
		);

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
			taskEither.right(nexusResult)
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
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for Docker project with no existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.1.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
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
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('kubernetes only, grabs existing pre-release version for Docker project from Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
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
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});

	it('kubernetes only, cannot find existing pre-release version for Docker project in Nexus', async () => {
		const nexusResult: NexusSearchResult = {
			items: []
		};
		searchForDockerBetasMock.mockImplementation(() =>
			taskEither.right(nexusResult)
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
		expect(result).toEqualLeft(
			new Error('No matching Docker pre-release versions in Nexus')
		);

		expect(searchForDockerBetasMock).toHaveBeenCalledWith(
			'my-project',
			'1.0.0-beta*'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(osMock.homedir).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
	});
});
