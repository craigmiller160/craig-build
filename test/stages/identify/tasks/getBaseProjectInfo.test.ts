import getBaseProjectInfo from '../../../../src/stages/identify/tasks/getBaseProjectInfo';
import path from 'path';
import getCwd from '../../../../src/utils/getCwd';
import ProjectType from '../../../../src/types/ProjectType';
import Mock = jest.Mock;
import '@relmify/jest-fp-ts';

const getCwdMock: Mock = getCwd as Mock;

describe('getBaseProjectInfo task', () => {
    it('get Maven ProjectInfo', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseApplication'));
        const result = await getBaseProjectInfo(ProjectType.MavenApplication)();
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
        });
    });

    it('get Maven ProjectInfo for snapshot', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenSnapshotApplication'));
        const result = await getBaseProjectInfo(ProjectType.MavenApplication)();
        expect(result).toEqualRight({
            projectType: ProjectType.MavenApplication,
            name: 'email-service',
            version: '1.2.0-SNAPSHOT',
            isPreRelease: true,
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
                    version: '1.2.0-SNAPSHOT'
                },
                {
                    name: 'io.craigmiller160/spring-web-utils',
                    version: '1.1.2'
                }
            ]
        });
    });

    it('get Npm ProjectInfo', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseApplication'));
        const result = await getBaseProjectInfo(ProjectType.NpmApplication)();
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

    it('get Npm ProjectInfo for beta', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmBetaApplication'));
        const result = await getBaseProjectInfo(ProjectType.NpmApplication)();
        expect(result).toEqualRight({
            projectType: ProjectType.NpmApplication,
            name: 'craig-build',
            version: '1.0.0-beta',
            isPreRelease: true,
            dependencies: [
                {
                    name: '@craigmiller160/react-web-config',
                    version: '^1.0.0-beta'
                },
                {
                    name: '@material-ui/core',
                    version: '^1.0.0-beta'
                },
                {
                    name: '@craigmiller160/foo-bar',
                    version: '^1.0.0-beta'
                },
                {
                    name: '@craigmiller160/abc-def',
                    version: '^1.0.0'
                }
            ]
        });
    });

    it('get DockerImage ProjectInfo for beta', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'dockerBetaImage'));
        const result = await getBaseProjectInfo(ProjectType.DockerImage)();
        expect(result).toEqualRight({
            projectType: ProjectType.DockerImage,
            name: 'nginx-base',
            version: 'latest',
            isPreRelease: true,
            dependencies: []
        });
    });

    it('get DockerImage ProjectInfo for release', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'dockerReleaseImage'));
        const result = await getBaseProjectInfo(ProjectType.DockerImage)();
        expect(result).toEqualRight({
            projectType: ProjectType.DockerImage,
            name: 'nginx-base',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: []
        });
    });

    it('get DockerApplication ProjectInfo for beta', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'dockerBetaApplication'));
        const result = await getBaseProjectInfo(ProjectType.DockerApplication)();
        expect(result).toEqualRight({
            projectType: ProjectType.DockerApplication,
            name: 'nginx-base',
            version: 'latest',
            isPreRelease: true,
            dependencies: []
        });
    });

    it('get DockerApplication ProjectInfo for release', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'dockerReleaseApplication'));
        const result = await getBaseProjectInfo(ProjectType.DockerApplication)();
        expect(result).toEqualRight({
            projectType: ProjectType.DockerApplication,
            name: 'nginx-base',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: []
        });
    });
});
