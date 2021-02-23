import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import runCommand from '../../../../src/utils/runCommand';
import dockerBuild, { TASK_NAME } from '../../../../src/stages/deploy/tasks/dockerBuild';
import BuildError from '../../../../src/error/BuildError';
import getCwd from '../../../../src/utils/getCwd';
import shellEnv from 'shell-env';
import * as E from 'fp-ts/Either';
import stageName from '../../../../src/stages/deploy/stageName';

jest.mock('shell-env', () => ({
    sync: jest.fn()
}));

const baseProjectInfo: ProjectInfo = {
    projectType: ProjectType.MavenApplication,
    isPreRelease: false,
    name: 'my-project',
    version: '1.0.0',
    kubernetesDockerImage: 'my-project:1.0.0',
    dependencies: []
};

const runCommandMock = runCommand as jest.Mock;
const getCwdMock = getCwd as jest.Mock;
const syncMock = shellEnv.sync as jest.Mock;

describe('dockerBuild task', () => {
    describe('validations',  () => {
        it('has no kubernetesDockerImage', async () => {
            getCwdMock.mockImplementation(() => '');
            syncMock.mockImplementationOnce(() => ({}));
            const result = await dockerBuild({
                ...baseProjectInfo,
                kubernetesDockerImage: undefined
            })();
            expect(result).toEqualLeft(new BuildError('Missing Kubernetes Docker Image', stageName, TASK_NAME));
        });

        it('has no docker username', async () => {
            getCwdMock.mockImplementation(() => '');
            syncMock.mockImplementationOnce(() => ({
                NEXUS_DOCKER_PASSWORD: 'abc'
            }));
            const result = await dockerBuild(baseProjectInfo)();
            expect(result).toEqualLeft(new BuildError('Missing Docker credential environment variables', stageName, TASK_NAME));
        });

        it('has no docker password', async () => {
            getCwdMock.mockImplementation(() => '');
            syncMock.mockImplementationOnce(() => ({
                NEXUS_DOCKER_USER: 'abc'
            }));
            const result = await dockerBuild(baseProjectInfo)();
            expect(result).toEqualLeft(new BuildError('Missing Docker credential environment variables', stageName, TASK_NAME));
        });
    });

    it('builds and pushes docker image', async () => {
        getCwdMock.mockImplementation(() => '/');
        syncMock.mockImplementationOnce(() => ({
            NEXUS_DOCKER_USER: 'abc',
            NEXUS_DOCKER_PASSWORD: 'def'
        }));
        runCommandMock.mockImplementation(() => E.right(''));

        const result = await dockerBuild(baseProjectInfo)();
        expect(result).toEqualRight(baseProjectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(4);
        expect(runCommandMock).toHaveBeenNthCalledWith(
            1,
            'sudo docker login craigmiller160.ddns.net:30004 -u abc -p def',
            {
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            2,
            'sudo docker image ls | grep my-project | grep latest | awk \'{ print $3 }\' | xargs docker image rm',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            3,
            'sudo docker build --network=host -t my-project:1.0.0 .',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            4,
            'sudo docker push my-project:1.0.0',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
    });
});
