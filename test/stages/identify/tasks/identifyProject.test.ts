import identifyProject, { TASK_NAME } from '../../../../src/stages/identify/tasks/identifyProject';
import Mock = jest.Mock;
import getCwd from '../../../../src/utils/getCwd';
import path from 'path';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../src/error/BuildError';

const getCwdMock: Mock = getCwd as Mock;

describe('identifyProject task', () => {
    it('is NpmApplication', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseApplication'));
        const result = identifyProject();
        expect(result).toEqualRight(ProjectType.NpmApplication);
    });

    it('is NpmLibrary', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseLibrary'));
        const result = identifyProject();
        expect(result).toEqualRight(ProjectType.NpmLibrary);
    });

    it('is MavenApplication', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseApplication'));
        const result = identifyProject();
        expect(result).toEqualRight(ProjectType.MavenApplication);
    });

    it('is MavenLibrary', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseLibrary'));
        const result = identifyProject();
        expect(result).toEqualRight(ProjectType.MavenLibrary);
    });

    it('is unknown project', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__'));
        const result = identifyProject();
        expect(result).toEqualLeft(new BuildError('Unable to identify project type', {
            taskName: TASK_NAME
        }));
    });
});
