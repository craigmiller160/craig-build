import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { getCwdMock } from '../testutils/getCwdMock';
import { downloadArtifactForDeployment } from '../../src/stages/downloadArtifactForDeployment';
import '@relmify/jest-fp-ts';
import {
	downloadArtifact,
	searchForMavenSnapshots,
	searchForMavenReleases,
	searchForNpmBetas,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';
import * as TE from 'fp-ts/TaskEither';
import { NexusSearchResultItem } from '../../src/services/NexusSearchResult';
import { rmDirIfExists, mkdir } from '../../src/functions/File';
import * as E from 'fp-ts/Either';

jest.mock('../../src/services/NexusRepoApi', () => ({
	downloadArtifact: jest.fn(),
	searchForMavenSnapshots: jest.fn(),
	searchForMavenReleases: jest.fn(),
	searchForNpmBetas: jest.fn(),
	searchForNpmReleases: jest.fn()
}));

jest.mock('../../src/functions/File', () => ({
	mkdir: jest.fn(),
	rmDirIfExists: jest.fn()
}));

const downloadArtifactMock = downloadArtifact as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;
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
		isPreRelease: false,
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

	it('skips for Docker project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication
		};

		const result = await downloadArtifactForDeployment.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);

		expect(downloadArtifactMock).not.toHaveBeenCalled();
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
		expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
		expect(mkdirMock).not.toHaveBeenCalled();
		expect(rmDirIfExistsMock).not.toHaveBeenCalled();
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
				isPreRelease: false
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
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
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
		searchForMavenSnapshotsMock.mockImplementation(() =>
			TE.right({ items: [createItem('1.1.0-20211225.003019-1', 'jar')] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				version: '1.1.0-20211225.003019-1',
				isPreRelease: true
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
		expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(
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
				isPreRelease: false
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
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
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
				isPreRelease: true
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
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
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
