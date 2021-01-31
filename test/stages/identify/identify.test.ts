import identify, { STAGE_NAME } from '../../../src/stages/identify';
import identifyProject from '../../../src/stages/identify/tasks/identifyProject';
import Mock = jest.Mock;
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import ProjectType from '../../../src/types/ProjectType';
import ProjectInfo from '../../../src/types/ProjectInfo';
import getBaseProjectInfo from '../../../src/stages/identify/tasks/getBaseProjectInfo';
import '@relmify/jest-fp-ts';
import getKubeProjectInfo from '../../../src/stages/identify/tasks/getKubeProjectInfo';
import BuildError from '../../../src/error/BuildError';
import getNexusProjectInfo from '../../../src/stages/identify/tasks/getNexusProjectInfo';

jest.mock('../../../src/stages/identify/tasks/identifyProject', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getBaseProjectInfo', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getKubeProjectInfo', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getNexusProjectInfo', () => jest.fn());

const identifyProjectMock: Mock = identifyProject as Mock;
const getBaseProjectInfoMock: Mock = getBaseProjectInfo as Mock;
const getKubeProjectInfoMock: Mock = getKubeProjectInfo as Mock;
const getNexusProjectInfoMock: Mock = getNexusProjectInfo as Mock;

describe('identify stage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('completes successfully for library', async () => {
        const projectType = ProjectType.MavenLibrary;
        const projectInfo: ProjectInfo = {
            projectType,
            name: 'email-service',
            version: '1.2.0',
            dependencies: [],
            isPreRelease: false
        };
        const nexusProjectInfo: ProjectInfo = {
            ...projectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: '1',
                latestReleaseVersion: '2'
            }
        };
        identifyProjectMock.mockImplementation(() => E.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => E.right(projectInfo));
        getNexusProjectInfoMock.mockImplementation(() => TE.right(nexusProjectInfo));

        const result = await identify()();
        expect(result).toEqualRight(nexusProjectInfo);

        expect(identifyProjectMock).toHaveBeenCalled();
        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getNexusProjectInfoMock).toHaveBeenCalledWith(projectInfo);
        expect(getKubeProjectInfoMock).not.toHaveBeenCalled();
    });

    it('completes successfully for application', async () => {
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
        identifyProjectMock.mockImplementation(() => E.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => E.right(projectInfo));
        getKubeProjectInfoMock.mockImplementation(() => E.right(kubeProjectInfo));
        getNexusProjectInfoMock.mockImplementation(() => TE.right(nexusProjectInfo));

        const result = await identify()();
        expect(result).toEqualRight(nexusProjectInfo);

        expect(identifyProjectMock).toHaveBeenCalled();
        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).toHaveBeenCalledWith(projectInfo);
        expect(getNexusProjectInfoMock).toHaveBeenCalledWith(kubeProjectInfo);
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
        identifyProjectMock.mockImplementation(() => E.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => E.left(new BuildError('Failing')));

        const result = await identify()();
        expect(result).toEqualLeft(new BuildError('Failing', { stageName: STAGE_NAME }));

        expect(identifyProjectMock).toHaveBeenCalled();
        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).not.toHaveBeenCalled();
        expect(getNexusProjectInfoMock).not.toHaveBeenCalled();
    });
});
