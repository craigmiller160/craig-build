import {
	beforeEach,
	describe,
	expect,
	it,
	MockedFunction,
	test,
	vi
} from 'vitest';
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

beforeEach(() => {
	vi.resetAllMocks();
});

test.fails('support monorepo');

type PreReleaseVersionArgs = Readonly<{
	commandType: CommandType;
	matchInNexus: boolean;
}>;

test.each<PreReleaseVersionArgs>([
	{ commandType: CommandType.FullBuild, matchInNexus: true },
	{ commandType: CommandType.FullBuild, matchInNexus: false },
	{ commandType: CommandType.DockerOnly, matchInNexus: true },
	{ commandType: CommandType.DockerOnly, matchInNexus: false }
])(
	'preparePreReleaseVersion for NPM with command $commandType and match in Nexus $matchInNexus',
	async ({ commandType, matchInNexus }) => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() => {
			if (matchInNexus) {
				return taskEither.right(nexusResult);
			}
			return taskEither.right({ items: [] });
		});

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: commandType
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
		if (commandType === CommandType.FullBuild && matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.0.0-beta.3'
				}
			});
		} else if (commandType === CommandType.FullBuild && !matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.0.0-beta.1'
				}
			});
		} else if (commandType !== CommandType.FullBuild && matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.0.0-beta.2'
				}
			});
		} else if (commandType !== CommandType.FullBuild && !matchInNexus) {
			expect(result).toEqualLeft(
				new Error('No matching NPM pre-release versions in Nexus')
			);
		} else {
			throw new Error('Invalid combination of arguments');
		}
	}
);

test.each<PreReleaseVersionArgs>([
	{ commandType: CommandType.FullBuild, matchInNexus: false },
	{ commandType: CommandType.DockerOnly, matchInNexus: true },
	{ commandType: CommandType.DockerOnly, matchInNexus: false }
])(
	'preparePreReleaseVersion for NPM with command $commandType and match in Nexus $matchInNexus',
	async ({ commandType, matchInNexus }) => {
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
		if (commandType === CommandType.FullBuild) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.1.0-20211225.003019-1'
				}
			});
			expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
		}
		/*
		 * Maven
		 * 1. Full Build - Looks up pre-release version from .m2
		 * 2. Not Full Build - Looks up pre-release version from Nexus
		 * 3. Not Full Build - Cannot find pre-release version in Nexus
		 */
	}
);

describe('preparePreReleaseVersion', () => {
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
