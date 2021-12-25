import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { downloadArtifactForDeployment } from '../../src/stages/downloadArtifactForDeployment';
import '@relmify/jest-fp-ts';
import { downloadArtifact, searchForMavenSnapshots, searchForMavenReleases, searchForNpmBetas, searchForNpmReleases } from '../../src/services/NexusRepoApi';

jest.mock('../../src/services/NexusRepoApi', () => ({
	downloadArtifact: jest.fn()
}));

const baseBuildContext = createBuildContext();
const downloadArtifactMock = downloadArtifact as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;

describe('downloadArtifactForDeployment', () => {
	beforeEach(() => {
		jest.resetAllMocks();
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
		throw new Error();
	});

	it('downloads maven pre-release artifact', async () => {
		throw new Error();
	});

	it('downloads npm release artifact', async () => {
		throw new Error();
	});

	it('downloads npm pre-release artifact', async () => {
		throw new Error();
	});
});
