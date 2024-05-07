import { beforeEach, expect, MockedFunction, test, vi } from 'vitest';
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
import { isDocker, isJvm, isNpm } from '../../src/context/projectTypeUtils';

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
	},
	{
		projectType: ProjectType.GradleApplication,
		repoType: 'polyrepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.GradleApplication,
		repoType: 'polyrepo',
		hasConflicts: false
	},
	{
		projectType: ProjectType.GradleApplication,
		repoType: 'monorepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.GradleApplication,
		repoType: 'monorepo',
		hasConflicts: false
	},
	{
		projectType: ProjectType.DockerApplication,
		repoType: 'polyrepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.DockerApplication,
		repoType: 'polyrepo',
		hasConflicts: false
	},
	{
		projectType: ProjectType.DockerApplication,
		repoType: 'monorepo',
		hasConflicts: true
	},
	{
		projectType: ProjectType.DockerApplication,
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
								},
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
			.when(isJvm, () => searchForMavenReleasesMock)
			.when(isNpm, () => searchForNpmReleasesMock)
			.when(isDocker, () => searchForDockerReleasesMock)
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

		if (repoType === 'monorepo') {
			expect(searchFn).toHaveBeenCalledTimes(2);
		} else {
			expect(searchFn).toHaveBeenCalledTimes(1);
		}
	}
);
