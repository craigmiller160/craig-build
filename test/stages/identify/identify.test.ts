import identify from '../../../src/stages/identify';
import identifyProject from '../../../src/stages/identify/tasks/identifyProject';
import Mock = jest.Mock;
import * as TE from 'fp-ts/TaskEither';
import ProjectType from '../../../src/types/ProjectType';
import ProjectInfo from '../../../src/types/ProjectInfo';
import getBaseProjectInfo from '../../../src/stages/identify/tasks/getBaseProjectInfo';
import '@relmify/jest-fp-ts';
import getKubeProjectInfo from '../../../src/stages/identify/tasks/getKubeProjectInfo';
import BuildError from '../../../src/error/BuildError';
import getNexusProjectInfo from '../../../src/common/tasks/getNexusProjectInfo';
import stageName from '../../../src/stages/identify/stageName';

jest.mock('../../../src/stages/identify/tasks/identifyProject', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getBaseProjectInfo', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getKubeProjectInfo', () => jest.fn());
jest.mock('../../../src/common/tasks/getNexusProjectInfo', () => jest.fn());

const identifyProjectMock: Mock = identifyProject as Mock;
const getBaseProjectInfoMock: Mock = getBaseProjectInfo as Mock;
const getKubeProjectInfoMock: Mock = getKubeProjectInfo as Mock;
const getNexusProjectInfoMock: Mock = getNexusProjectInfo as Mock;

describe('identify stage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('completes successfully', async () => {
        const projectType = ProjectType.MavenApplication;
        const projectInfo: ProjectInfo = {
            projectType,
            name: 'email-service',
            version: '1.2.0',
            dependencies: [],
            isPreRelease: false
        };
        const kubeProjectInfo: ProjectInfo = {
            ...projectInfo,
            kubernetesDockerImage: 'ABCDEFG'
        };
        const nexusProjectInfo: ProjectInfo = {
            ...kubeProjectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: '1',
                latestReleaseVersion: '2'
            }
        };
        identifyProjectMock.mockImplementation(() => TE.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => TE.right(projectInfo));
        getKubeProjectInfoMock.mockImplementation(() => TE.right(kubeProjectInfo));
        getNexusProjectInfoMock.mockImplementation(() => () => TE.right(nexusProjectInfo));

        const result = await identify(undefined)();
        expect(result).toEqualRight(nexusProjectInfo);

        expect(identifyProjectMock).toHaveBeenCalled();
        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).toHaveBeenCalledWith(projectInfo);
        expect(getNexusProjectInfoMock).toHaveBeenCalledWith(stageName);
    });

    it('completes with error', async () => {
        const projectType = ProjectType.MavenLibrary;
        const projectInfo: ProjectInfo = {
            projectType,
            name: 'email-service',
            version: '1.2.0',
            dependencies: [],
            isPreRelease: false
        };
        identifyProjectMock.mockImplementation(() => TE.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => TE.left(new BuildError('Failing', stageName)));

        const result = await identify(undefined)();
        expect(result).toEqualLeft(new BuildError('Failing', stageName));

        expect(identifyProjectMock).toHaveBeenCalled();
        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).not.toHaveBeenCalled();
        expect(getNexusProjectInfoMock).toHaveBeenCalledWith(stageName);
    });
});
