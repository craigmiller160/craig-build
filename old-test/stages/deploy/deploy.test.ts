import '@relmify/jest-fp-ts';
import kubeDeploy from '../../../old-src/stages/deploy/tasks/kubeDeploy';
import dockerBuild from '../../../old-src/stages/deploy/tasks/dockerBuild';
import downloadArtifact from '../../../old-src/stages/deploy/tasks/downloadArtifact';
import ProjectInfo from '../../../old-src/types/ProjectInfo';
import ProjectType from '../../../old-src/types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import deploy from '../../../old-src/stages/deploy';
import bumpDockerBeta from '../../../old-src/stages/deploy/tasks/bumpDockerPreReleaseVersion';

jest.mock('../../../src/stages/deploy/tasks/kubeDeploy', () => jest.fn());
jest.mock('../../../src/stages/deploy/tasks/dockerBuild', () => jest.fn());
jest.mock('../../../src/stages/deploy/tasks/downloadArtifact', () => jest.fn());
jest.mock('../../../src/stages/deploy/tasks/bumpDockerPreReleaseVersion', () =>
	jest.fn()
);

const kubeDeployMock = kubeDeploy as jest.Mock;
const dockerBuildMock = dockerBuild as jest.Mock;
const downloadArtifactMock = downloadArtifact as jest.Mock;
const bumpDockerBetaMock = bumpDockerBeta as jest.Mock;

const projectInfo: ProjectInfo = {
	projectType: ProjectType.NpmApplication,
	group: 'craigmiller160',
	name: 'my-project',
	version: '1.0.0',
	dependencies: [],
	isPreRelease: false
};

describe('deploy stage', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('completes successfully', async () => {
		kubeDeployMock.mockImplementation(() => TE.right(projectInfo));
		dockerBuildMock.mockImplementation(() => TE.right(projectInfo));
		downloadArtifactMock.mockImplementation(() => TE.right(projectInfo));
		bumpDockerBetaMock.mockImplementation(() => TE.right(projectInfo));

		const result = await deploy(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(dockerBuildMock).toHaveBeenCalledWith(projectInfo);
		expect(kubeDeployMock).toHaveBeenCalledWith(projectInfo);
		expect(downloadArtifactMock).toHaveBeenCalledWith(projectInfo);
		expect(bumpDockerBetaMock).toHaveBeenCalledWith(projectInfo);
	});
});
