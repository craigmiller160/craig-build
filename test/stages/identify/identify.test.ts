import identify, { STAGE_NAME } from '../../../src/stages/identify';
import identifyProject from '../../../src/stages/identify/tasks/identifyProject';
import Mock = jest.Mock;
import * as E from 'fp-ts/Either';
import ProjectType from '../../../src/types/ProjectType';
import ProjectInfo from '../../../src/types/ProjectInfo';
import getBaseProjectInfo from '../../../src/stages/identify/tasks/getBaseProjectInfo';
import '@relmify/jest-fp-ts';
import getKubeProjectInfo from '../../../src/stages/identify/tasks/getKubeProjectInfo';
import BuildError from '../../../src/error/BuildError';

jest.mock('../../../src/stages/identify/tasks/identifyProject', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getBaseProjectInfo', () => jest.fn());
jest.mock('../../../src/stages/identify/tasks/getKubeProjectInfo', () => jest.fn());

const identifyProjectMock: Mock = identifyProject as Mock;
const getBaseProjectInfoMock: Mock = getBaseProjectInfo as Mock;
const getKubeProjectInfoMock: Mock = getKubeProjectInfo as Mock;

describe('identify stage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('completes successfully for library', () => {
        const projectType = ProjectType.MavenLibrary;
        const projectInfo: ProjectInfo = {
            projectType,
            name: 'email-service',
            version: '1.2.0',
            dependencies: []
        };
        identifyProjectMock.mockImplementation(() => E.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => E.right(projectInfo));

        const result = identify();
        expect(result).toEqualRight(projectInfo);

        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).not.toHaveBeenCalled();
    });

    it('completes successfully for application', () => {
        const projectType = ProjectType.MavenApplication;
        const projectInfo: ProjectInfo = {
            projectType,
            name: 'email-service',
            version: '1.2.0',
            dependencies: []
        };
        const kubeProjectInfo: ProjectInfo = {
            ...projectInfo,
            kubernetesDockerImage: 'ABCDEFG'
        };
        identifyProjectMock.mockImplementation(() => E.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => E.right(projectInfo));
        getKubeProjectInfoMock.mockImplementation(() => E.right(kubeProjectInfo));

        const result = identify();
        expect(result).toEqualRight(kubeProjectInfo);

        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).toHaveBeenCalledWith(projectInfo);
    });

    it('completes with error', () => {
        const projectType = ProjectType.MavenLibrary;
        const projectInfo: ProjectInfo = {
            projectType,
            name: 'email-service',
            version: '1.2.0',
            dependencies: []
        };
        identifyProjectMock.mockImplementation(() => E.right(projectType));
        getBaseProjectInfoMock.mockImplementation(() => E.left(new BuildError('Failing')));

        const result = identify();
        expect(result).toEqualLeft(new BuildError('Failing', { stageName: STAGE_NAME }));

        expect(getBaseProjectInfoMock).toHaveBeenCalledWith(projectType);
        expect(getKubeProjectInfoMock).not.toHaveBeenCalled();
    });
});
