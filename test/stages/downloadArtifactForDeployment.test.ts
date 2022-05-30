import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { getCwdMock } from '../testutils/getCwdMock';
import { downloadArtifactForDeployment } from '../../src/stages/downloadArtifactForDeployment';
import '@relmify/jest-fp-ts';
import {
	downloadArtifact,
	searchForMavenReleases,
	searchForMavenSnapshotsExplicit,
	searchForNpmBetas,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';
import * as TE from 'fp-ts/TaskEither';
import { NexusSearchResultItem } from '../../src/services/NexusSearchResult';
import { mkdir, rmDirIfExists } from '../../src/functions/File';
import * as E from 'fp-ts/Either';
import { VersionType } from '../../src/context/VersionType';

jest.mock('../../src/services/NexusRepoApi', () => ({
	downloadArtifact: jest.fn(),
	searchForMavenSnapshots: jest.fn(),
	searchForMavenReleases: jest.fn(),
	searchForNpmBetas: jest.fn(),
	searchForNpmReleases: jest.fn(),
	searchForMavenSnapshotsExplicit: jest.fn()
}));

jest.mock('../../src/functions/File', () => ({
	mkdir: jest.fn(),
	rmDirIfExists: jest.fn()
}));

const downloadArtifactMock = downloadArtifact as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;
const searchForMavenSnapshotsExplicitMock =
	searchForMavenSnapshotsExplicit as jest.Mock;
const mkdirMock = mkdir as jest.Mock;
const rmDirIfExistsMock = rmDirIfExists as jest.Mock;

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
		version: ''
	}
});

describe('downloadArtifactForDeployment', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		downloadArtifactMock.mockImplementation(() => TE.right(''));
		mkdirMock.mockImplementation(() => E.right(''));
		rmDirIfExistsMock.mockImplementation(() => E.right(''));
	});

	it('downloads maven release artifact', async () => {
		getCwdMock.mockImplementation(() => '/foo');
		searchForMavenReleasesMock.mockImplementation(() =>
			TE.right({ items: [createItem('1.0.0', 'jar')] })
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

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
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
			TE.right({ items: [createItem('1.0.0', 'jar')] })
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

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
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
			TE.right({ items: [createItem('1.1.0-20211225.003019-1', 'jar')] })
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

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
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
			TE.right({ items: [createItem('1.1.0-20211225.003019-1', 'jar')] })
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

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
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
			TE.right({ items: [createItem('1.0.0', 'tgz')] })
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

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
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
			TE.right({ items: [createItem('1.0.0-beta.5', 'tgz')] })
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

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
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
