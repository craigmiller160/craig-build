import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { getCwdMock } from '../testutils/getCwdMock';
import { downloadArtifactForDeployment } from '../../src/stages/downloadArtifactForDeployment';

import {
	downloadArtifact,
	searchForMavenReleases,
	searchForMavenSnapshotsExplicit,
	searchForNpmBetas,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';
import { taskEither, function as func } from 'fp-ts';
import { NexusSearchResultItem } from '../../src/services/NexusSearchResult';
import { mkdir, rmDirIfExists } from '../../src/functions/File';
import { either } from 'fp-ts';
import { VersionType } from '../../src/context/VersionType';

vi.mock('../../src/services/NexusRepoApi', () => ({
	downloadArtifact: vi.fn(),
	searchForMavenSnapshots: vi.fn(),
	searchForMavenReleases: vi.fn(),
	searchForNpmBetas: vi.fn(),
	searchForNpmReleases: vi.fn(),
	searchForMavenSnapshotsExplicit: vi.fn()
}));

vi.mock('../../src/functions/File', () => ({
	mkdir: vi.fn(),
	rmDirIfExists: vi.fn()
}));

const downloadArtifactMock = downloadArtifact as MockedFunction<
	typeof downloadArtifact
>;
const searchForMavenReleasesMock = searchForMavenReleases as MockedFunction<
	typeof searchForMavenReleases
>;
const searchForNpmBetasMock = searchForNpmBetas as MockedFunction<
	typeof searchForNpmBetas
>;
const searchForNpmReleasesMock = searchForNpmReleases as MockedFunction<
	typeof searchForNpmReleases
>;
const searchForMavenSnapshotsExplicitMock =
	searchForMavenSnapshotsExplicit as MockedFunction<
		typeof searchForMavenSnapshotsExplicit
	>;
const mkdirMock = mkdir as MockedFunction<typeof mkdir>;
const rmDirIfExistsMock = rmDirIfExists as MockedFunction<typeof rmDirIfExists>;

const createItem = (version: string, ext: string): NexusSearchResultItem => ({
	name: '',
	version,
	group: '',
	format: '',
	repository: '',
	assets: [
		{
			id: '',
			downloadUrl: `downloadUrl.${ext}`,
			path: ''
		}
	],
	id: ''
});

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		versionType: VersionType.Release,
		version: '',
		repoType: 'polyrepo'
	}
});

describe('downloadArtifactForDeployment', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		downloadArtifactMock.mockImplementation(() => taskEither.right(''));
		mkdirMock.mockImplementation(() => either.right(''));
		rmDirIfExistsMock.mockImplementation(() =>
			either.right(func.constVoid())
		);
	});

	it('downloads maven release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForMavenReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.0.0', 'jar')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};

		const result =
			await downloadArtifactForDeployment.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).toHaveBeenCalledWith(
			'downloadUrl.jar',
			'/foo/deploy/build/my-project-1.0.0.jar'
		);
		expect(searchForMavenSnapshotsExplicitMock).not.toHaveBeenCalled();
		expect(searchForMavenReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
		expect(mkdirMock).toHaveBeenCalledWith('/foo/deploy/build');
		expect(rmDirIfExistsMock).toHaveBeenCalledWith('/foo/deploy/build');
	});

	it('downloads gradle release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForMavenReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.0.0', 'jar')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};

		const result =
			await downloadArtifactForDeployment.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).toHaveBeenCalledWith(
			'downloadUrl.jar',
			'/foo/deploy/build/my-project-1.0.0.jar'
		);
		expect(searchForMavenSnapshotsExplicitMock).not.toHaveBeenCalled();
		expect(searchForMavenReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
		expect(mkdirMock).toHaveBeenCalledWith('/foo/deploy/build');
		expect(rmDirIfExistsMock).toHaveBeenCalledWith('/foo/deploy/build');
	});

	it('downloads maven pre-release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForMavenSnapshotsExplicitMock.mockImplementation(() =>
			taskEither.right({
				items: [createItem('1.1.0-20211225.003019-1', 'jar')]
			})
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.1.0-20211225.003019-1',
				versionType: VersionType.PreRelease
			}
		};

		const result =
			await downloadArtifactForDeployment.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).toHaveBeenCalledWith(
			'downloadUrl.jar',
			'/foo/deploy/build/my-project-1.1.0-20211225.003019-1.jar'
		);
		expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsExplicit).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.1.0-20211225.003019-1'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
		expect(mkdirMock).toHaveBeenCalledWith('/foo/deploy/build');
		expect(rmDirIfExistsMock).toHaveBeenCalledWith('/foo/deploy/build');
	});

	it('downloads gradle pre-release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForMavenSnapshotsExplicitMock.mockImplementation(() =>
			taskEither.right({
				items: [createItem('1.1.0-20211225.003019-1', 'jar')]
			})
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.1.0-20211225.003019-1',
				versionType: VersionType.PreRelease
			}
		};

		const result =
			await downloadArtifactForDeployment.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).toHaveBeenCalledWith(
			'downloadUrl.jar',
			'/foo/deploy/build/my-project-1.1.0-20211225.003019-1.jar'
		);
		expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsExplicit).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.1.0-20211225.003019-1'
		);
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
		expect(mkdirMock).toHaveBeenCalledWith('/foo/deploy/build');
		expect(rmDirIfExistsMock).toHaveBeenCalledWith('/foo/deploy/build');
	});

	it('downloads npm release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForNpmReleasesMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.0.0', 'tgz')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};

		const result =
			await downloadArtifactForDeployment.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).toHaveBeenCalledWith(
			'downloadUrl.tgz',
			'/foo/deploy/build/my-project-1.0.0.tgz'
		);
		expect(searchForMavenSnapshotsExplicitMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0'
		);
		expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(mkdirMock).toHaveBeenCalledWith('/foo/deploy/build');
		expect(rmDirIfExistsMock).toHaveBeenCalledWith('/foo/deploy/build');
	});

	it('downloads npm pre-release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForNpmBetasMock.mockImplementation(() =>
			taskEither.right({ items: [createItem('1.0.0-beta.5', 'tgz')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.0.0-beta.5',
				versionType: VersionType.PreRelease
			}
		};

		const result =
			await downloadArtifactForDeployment.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).toHaveBeenCalledWith(
			'downloadUrl.tgz',
			'/foo/deploy/build/my-project-1.0.0-beta.5.tgz'
		);
		expect(searchForMavenSnapshotsExplicitMock).not.toHaveBeenCalled();
		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0-beta.5'
		);
		expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
		expect(mkdirMock).toHaveBeenCalledWith('/foo/deploy/build');
		expect(rmDirIfExistsMock).toHaveBeenCalledWith('/foo/deploy/build');
	});
});
