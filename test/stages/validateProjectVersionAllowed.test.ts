import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import {
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';
import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';
import { NexusSearchResultItem } from '../../src/services/NexusSearchResult';
import { taskEither } from 'fp-ts';
import { VersionType } from '../../src/context/VersionType';

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

describe('validateProjectVersionAllowed', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
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

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualLeft(
			new Error('Project release version is not unique')
		);
	});
});
