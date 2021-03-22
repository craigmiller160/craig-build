import Mock = jest.Mock;
import getCwd from '../../../../src/utils/getCwd';
import '@relmify/jest-fp-ts';
import path from 'path';
import getKubeProjectInfo from '../../../../src/stages/identify/tasks/getKubeProjectInfo';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';

const getCwdMock: Mock = getCwd as Mock;

describe('getKubeProjectInfo task', () => {
    it('finds kubernetes info', async () => {
        getCwdMock.mockImplementation(() => path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseApplication'));
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.MavenApplication,
            name: 'email-service',
            version: '1.2.0',
            dependencies: [],
            isPreRelease: false
        };
        const result = await getKubeProjectInfo(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            kubernetesDeploymentName: 'email-service',
            kubernetesDockerImage: 'craigmiller160.ddns.net:30004/email-service:1.2.0'
        });
    });

    describe('skip execution', () => {
        it('is library', async () => {
            const projectInfo: ProjectInfo = {
                projectType: ProjectType.MavenLibrary,
                name: 'email-service',
                version: '1.2.0',
                dependencies: [],
                isPreRelease: false
            };
            const result = await getKubeProjectInfo(projectInfo)();
            expect(result).toEqualRight(projectInfo);
        });
    });
});
