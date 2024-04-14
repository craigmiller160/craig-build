import {
	beforeEach,
	describe,
	expect,
	it,
	MockedFunction,
	test,
	vi
} from 'vitest';
import {
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';

import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';
import {
	NexusSearchResult,
	NexusSearchResultItem
} from '../../src/services/NexusSearchResult';
import { taskEither } from 'fp-ts';
import { VersionType } from '../../src/context/VersionType';
import { RepoType } from '../../src/context/ProjectInfo';
import { match } from 'ts-pattern';
import { isMaven } from '../../src/context/projectTypeUtils';

vi.mock('../../src/services/NexusRepoApi', () => ({
	searchForDockerReleases: vi.fn(),
	searchForMavenReleases: vi.fn(),
	searchForNpmReleases: vi.fn()
}));

const searchForDockerReleasesMock = searchForDockerReleases as MockedFunction<
	typeof searchForDockerReleases
>;
const searchForMavenReleasesMock = searchForMavenReleases as MockedFunction<
	typeof searchForMavenReleases
>;
const searchForNpmReleasesMock = searchForNpmReleases as MockedFunction<
	typeof searchForNpmReleases
>;

const baseBuildContext = createBuildContext();

const invalidItem: NexusSearchResultItem = {
	id: '',
	repository: '',
	format: '',
	group: '',
	name: '',
	version: baseBuildContext.projectInfo.version,
	assets: []
};

type ValidationArgs = Readonly<{
	projectType: ProjectType;
	repoType: RepoType;
	hasConflicts: boolean;
}>;

beforeEach(() => {
	vi.resetAllMocks();
});

test.each<ValidationArgs>([
	{
		projectType: ProjectType.NpmApplication,
		repoType: 'polyrepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.NpmApplication,
		repoType: 'polyrepo',
		hasConflicts: false
	},
	{
		projectType: ProjectType.NpmApplication,
		repoType: 'monorepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.NpmApplication,
		repoType: 'monorepo',
		hasConflicts: false
	},
	{
		projectType: ProjectType.MavenApplication,
		repoType: 'polyrepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.MavenApplication,
		repoType: 'polyrepo',
		hasConflicts: false
	},
	{
		projectType: ProjectType.MavenApplication,
		repoType: 'monorepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.MavenApplication,
		repoType: 'monorepo',
		hasConflicts: false
	}
])(
	'validateProjectVersionAllowed for $projectType and $repoType when has conflicts = $hasConflicts',
	async ({ projectType, repoType, hasConflicts }) => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType,
			projectInfo: {
				...baseBuildContext.projectInfo,
				repoType,
				versionType: VersionType.Release,
				monorepoChildren:
					repoType === 'monorepo'
						? [
								{
									...baseBuildContext.projectInfo,
									repoType,
									versionType: VersionType.Release
								}
							]
						: undefined
			}
		};

		const searchFn = match<
			ProjectType,
			MockedFunction<
				(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					...args: any[]
				) => taskEither.TaskEither<Error, NexusSearchResult>
			>
		>(projectType)
			.when(isMaven, () => searchForMavenReleasesMock)
			.run();
		searchFn.mockImplementation(() => {
			if (hasConflicts) {
				return taskEither.right<Error, NexusSearchResult>({
					items: [invalidItem]
				});
			}
			return taskEither.right<Error, NexusSearchResult>({ items: [] });
		});

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		if (hasConflicts) {
			expect(result).toEqualLeft(
				new Error('Project release version is not unique')
			);
		} else {
			expect(result).toEqualRight(buildContext);
		}
	}
);

describe('validateProjectVersionAllowed', () => {
	it('allows npm release version with no conflicts', async () => {
		searchForNpmReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows maven release version with no conflicts', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows gradle kotlin release version with no conflicts', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows docker release version with no conflicts', async () => {
		searchForDockerReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('rejects npm release version with conflict', async () => {
		searchForNpmReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Project release version is not unique')
		);
	});

	it('rejects maven release version with conflicts', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Project release version is not unique')
		);
	});

	it('rejects gradle kotlin release version with conflicts', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Project release version is not unique')
		);
	});

	it('rejects docker release version with conflicts', async () => {
		searchForDockerReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		const result =
			await validateProjectVersionAllowed.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Project release version is not unique')
		);
	});
});
