import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
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
import NexusSearchResult, {
	NexusSearchResultItem
} from '../../old-src/types/NexusSearchResult';

jest.mock('../../src/services/NexusRepoApi', () => ({
	downloadArtifact: jest.fn()
}));

const downloadArtifactMock = downloadArtifact as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;

const createItem = (version: string): NexusSearchResultItem => ({
	name: '',
	version,
	group: '',
	format: '',
	repository: '',
	assets: [
		{
			id: '',
			downloadUrl: 'downloadUrl',
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
		expect(downloadArtifactMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
	});

	it('downloads maven release artifact', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			TE.right({ items: [createItem('1.0.0')] })
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
			'downloadUrl',
			'file.jar'
		);
		expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
		expect(searchForMavenReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.0.0'
		);
		expect(downloadArtifactMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
	});

	it('downloads maven pre-release artifact', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			TE.right({ items: [createItem('1.1.0-SNAPSHOT')] })
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
			'downloadUrl',
			'file.jar'
		);
		expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
		expect(searchForMavenReleasesMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project',
			'1.1.0-SNAPSHOT'
		);
		expect(downloadArtifactMock).not.toHaveBeenCalled();
		expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
	});

	it('downloads npm release artifact', async () => {
		throw new Error();
	});

	it('downloads npm pre-release artifact', async () => {
		throw new Error();
	});
});
