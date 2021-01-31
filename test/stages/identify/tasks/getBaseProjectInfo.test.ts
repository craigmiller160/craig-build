import getBaseProjectInfo from '../../../../src/stages/identify/tasks/getBaseProjectInfo';
import path from 'path';
import getCwd from '../../../../src/utils/getCwd';
import ProjectType from '../../../../src/types/ProjectType';
import Mock = jest.Mock;
import '@relmify/jest-fp-ts';

const getCwdMock: Mock = getCwd as Mock;

describe('getBaseProjectInfo task', () => {
    it('get Maven ProjectInfo', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseApplication'));
        const result = getBaseProjectInfo(ProjectType.MavenApplication);
        expect(result).toEqualRight({
            projectType: ProjectType.MavenApplication,
            name: 'email-service',
            version: '1.2.0',
            isPreRelease: false,
            dependencies: [
                {
                    name: 'org.springframework.boot/spring-boot-starter-actuator',
                    version: ''
                },
                {
                    name: 'org.postgresql/postgresql',
                    version: '42.2.18'
                },
                {
                    name: 'io.craigmiller160/api-test-processor',
                    version: '1.2.2'
                },
                {
                    name: 'io.craigmiller160/spring-web-utils',
                    version: '1.1.2'
                }
            ]
        })
    });

    it('get Maven ProjectInfo for snapshot', () => {
        throw new Error();
    });

    it('get Npm ProjectInfo', () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseApplication'));
        const result = getBaseProjectInfo(ProjectType.NpmApplication);
        expect(result).toEqualRight({
            projectType: ProjectType.NpmApplication,
            name: 'craig-build',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: [
                {
                    name: '@craigmiller160/react-web-config',
                    version: '^1.0.0'
                },
                {
                    name: '@material-ui/core',
                    version: '^1.0.0-beta'
                },
                {
                    name: '@craigmiller160/foo-bar',
                    version: '^1.0.0'
                },
                {
                    name: '@craigmiller160/abc-def',
                    version: '^1.0.0'
                }
            ]
        });
    });

    it('get Npm ProjectInfo for beta', () => {
        throw new Error();
    });
});
