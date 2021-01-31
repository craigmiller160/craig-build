import identifyProject from '../../../../src/stages/identify/tasks/identifyProject';
import Mock = jest.Mock;
import getCwd from '../../../../src/utils/getCwd';
import path from 'path';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';

const getCwdMock: Mock = getCwd as Mock;

describe('identifyProject task', () => {
    it('is NpmApplication', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseApplication'));
        const result = identifyProject();
        expect(result).toEqualRight(ProjectType.NpmApplication);
    });

    it('is NpmLibrary', () => {
        throw new Error();
    });

    it('is MavenApplication', () => {
        throw new Error();
    });

    it('is MavenLibrary', () => {
        throw new Error();
    });

    it('is unknown project', () => {
        throw new Error();
    });
});
