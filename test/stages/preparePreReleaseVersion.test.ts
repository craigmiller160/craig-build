import { beforeEach, expect, MockedFunction, test, vi } from 'vitest';
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
	'preparePreReleaseVersion for Maven monorepo with command $commandType and match in Nexus $matchInNexus',
	async ({ commandType, matchInNexus }) => {
		searchForMavenSnapshotsMock.mockImplementation(() => {
			if (matchInNexus) {
				return taskEither.right({
					items: [createItem('1.1.0-20211225.003019-1')]
				});
			}
			return taskEither.right({ items: [] });
		});
		osMock.homedir.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenPreReleaseInfoM2')
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: commandType
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'io.craigmiller160',
				name: 'my-project',
				versionType: VersionType.PreRelease,
				version: '1.1.0-SNAPSHOT',
				monorepoChildren: [
					{
						...baseBuildContext.projectInfo,
						name: 'my-child-project-1',
						version: '1.1.0-SNAPSHOT'
					},
					{
						...baseBuildContext.projectInfo,
						name: 'my-child-project-2',
						version: '1.1.0-SNAPSHOT'
					}
				]
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		if (commandType === CommandType.FullBuild) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.1.0-20211225.003019-1',
					monorepoChildren:
						buildContext.projectInfo.monorepoChildren?.map(
							(child, index) => ({
								...child,
								version: `1.1.0-20211225.003019-${index}`
							})
						) ?? []
				}
			});
			expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
		} else if (matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.1.0-20211225.003019-1',
					monorepoChildren:
						buildContext.projectInfo.monorepoChildren?.map(
							(child, index) => ({
								...child,
								version: `1.1.0-20211225.003019-${index}`
							})
						) ?? []
				}
			});
			expect(searchForMavenSnapshotsMock).toHaveBeenCalledTimes(3);
			expect(searchForMavenSnapshotsMock).toHaveBeenNthCalledWith(
				1,
				'io.craigmiller160',
				'my-project',
				'1.1.0-*'
			);
			expect(searchForMavenSnapshotsMock).toHaveBeenNthCalledWith(
				2,
				'io.craigmiller160',
				'my-child-project-1',
				'1.1.0-*'
			);
			expect(searchForMavenSnapshotsMock).toHaveBeenNthCalledWith(
				3,
				'io.craigmiller160',
				'my-child-project-2',
				'1.1.0-*'
			);
		} else if (!matchInNexus) {
			expect(result).toEqualLeft(
				new Error('No matching Maven pre-release versions in Nexus')
			);
			expect(searchForMavenSnapshotsMock).toHaveBeenNthCalledWith(
				1,
				'io.craigmiller160',
				'my-project',
				'1.1.0-*'
			);
			expect(searchForMavenSnapshotsMock).toHaveBeenNthCalledWith(
				2,
				'io.craigmiller160',
				'my-child-project-1',
				'1.1.0-*'
			);
			expect(searchForMavenSnapshotsMock).toHaveBeenNthCalledWith(
				3,
				'io.craigmiller160',
				'my-child-project-2',
				'1.1.0-*'
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
	'preparePreReleaseVersion for Maven with command $commandType and match in Nexus $matchInNexus',
	async ({ commandType, matchInNexus }) => {
		searchForMavenSnapshotsMock.mockImplementation(() => {
			if (matchInNexus) {
				return taskEither.right({
					items: [createItem('1.1.0-20211225.003019-1')]
				});
			}
			return taskEither.right({ items: [] });
		});
		osMock.homedir.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenPreReleaseInfoM2')
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: commandType
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
		if (commandType === CommandType.FullBuild) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.1.0-20211225.003019-1'
				}
			});
			expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
		} else if (matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.1.0-20211225.003019-1'
				}
			});
			expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(
				'io.craigmiller160',
				'my-project',
				'1.1.0-*'
			);
		} else if (!matchInNexus) {
			expect(result).toEqualLeft(
				new Error('No matching Maven pre-release versions in Nexus')
			);
			expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(
				'io.craigmiller160',
				'my-project',
				'1.1.0-*'
			);
		} else {
			throw new Error('Invalid combination of arguments');
		}
	}
);

test.each<PreReleaseVersionArgs>([
	{ commandType: CommandType.FullBuild, matchInNexus: true },
	{ commandType: CommandType.FullBuild, matchInNexus: false },
	{ commandType: CommandType.DockerOnly, matchInNexus: true },
	{ commandType: CommandType.DockerOnly, matchInNexus: false }
])(
	'preparePreReleaseVersion for Gradle with command $commandType and match in Nexus $matchInNexus',
	async ({ commandType, matchInNexus }) => {
		searchForMavenSnapshotsMock.mockImplementation(() => {
			if (matchInNexus) {
				return taskEither.right({
					items: [createItem('1.1.0-20211225.003019-1')]
				});
			}
			return taskEither.right({ items: [] });
		});

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: commandType
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
		if (matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.1.0-20211225.003019-1'
				}
			});
		} else {
			expect(result).toEqualLeft(
				new Error('No matching Maven pre-release versions in Nexus')
			);
		}
	}
);

test.each<PreReleaseVersionArgs>([
	{ commandType: CommandType.FullBuild, matchInNexus: true },
	{ commandType: CommandType.FullBuild, matchInNexus: false },
	{ commandType: CommandType.KubernetesOnly, matchInNexus: true },
	{ commandType: CommandType.KubernetesOnly, matchInNexus: false }
])(
	'preparePreReleaseVersion for Docker with command $commandType and match in Nexus $matchInNexus',
	async ({ commandType, matchInNexus }) => {
		searchForDockerBetasMock.mockImplementation(() => {
			if (matchInNexus) {
				return taskEither.right({
					items: [createItem('1.0.0-beta.2')]
				});
			}
			return taskEither.right({ items: [] });
		});

		const buildContext: BuildContext = {
			...baseBuildContext,
			commandInfo: {
				type: commandType
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
		expect(searchForDockerBetasMock).toHaveBeenCalledWith(
			'my-project',
			'1.0.0-beta*'
		);
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
		} else if (commandType === CommandType.KubernetesOnly && matchInNexus) {
			expect(result).toEqualRight({
				...buildContext,
				projectInfo: {
					...buildContext.projectInfo,
					version: '1.0.0-beta.2'
				}
			});
		} else if (
			commandType === CommandType.KubernetesOnly &&
			!matchInNexus
		) {
			expect(result).toEqualLeft(
				new Error('No matching Docker pre-release versions in Nexus')
			);
		} else {
			throw new Error('Invalid combination of arguments');
		}
	}
);
