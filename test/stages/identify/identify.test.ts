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

jest.mock('../../../src/stages/identify/tasks/identifyProject', () => {
    const real = jest.requireActual('../../../src/stages/identify/tasks/identifyProject');
    return {
        ...real,
        operation: jest.fn()
    };
});
jest.mock('../../../src/stages/identify/tasks/getBaseProjectInfo', () => {
    const real = jest.requireActual('../../../src/stages/identify/tasks/getBaseProjectInfo');
    return {
        ...real,
        operation: jest.fn()
    };
});
jest.mock('../../../src/stages/identify/tasks/getKubeProjectInfo', () => {
    const real = jest.requireActual('../../../src/stages/identify/tasks/getKubeProjectInfo');
    return {
        ...real,
        operation: jest.fn()
    };
});
jest.mock('../../../src/stages/identify/tasks/getNexusProjectInfo', () => {
    const real = jest.requireActual('../../../src/stages/identify/tasks/getNexusProjectInfo');
    return {
        ...real,
        operation: jest.fn()
    };
});

const identifyProjectMock: Mock = identifyProject.operation as Mock;
const getBaseProjectInfoMock: Mock = getBaseProjectInfo.operation as Mock;
const getKubeProjectInfoMock: Mock = getKubeProjectInfo.operation as Mock;
const getNexusProjectInfoMock: Mock = getNexusProjectInfo.operation as Mock;

// TODO update this to test the logging as well

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

        const result = await identify(undefined)();
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

        const result = await identify(undefined)();
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
        getBaseProjectInfoMock.mockImplementation(() => E.left(new BuildError('Failing', STAGE_NAME)));

        const result = await identify(undefined)();
        expect(result).toEqualLeft(new BuildError('Failing', STAGE_NAME));

        expect(identifyProjectMock).toHaveBeenCalled();
        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).not.toHaveBeenCalled();
        expect(getNexusProjectInfoMock).not.toHaveBeenCalled();
    });
});
