import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import runCommand from '../../../../src/utils/runCommand';
import dockerBuild, {TASK_NAME} from '../../../../src/stages/deploy/tasks/dockerBuild';
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
    group: 'io.craigmiller160',
    name: 'my-project',
    version: '1.0.0',
    kubernetesDockerImage: 'craigmiller160.ddns.net:30004/my-project:1.0.0',
    dependencies: []
};

const runCommandMock = runCommand as jest.Mock;
const getCwdMock = getCwd as jest.Mock;
const syncMock = shellEnv.sync as jest.Mock;

describe('dockerBuild task', () => {
    describe('validations',  () => {
        it('has no docker image', async () => {
            getCwdMock.mockImplementation(() => '');
            syncMock.mockImplementationOnce(() => ({
                NEXUS_DOCKER_USER: 'user',
                NEXUS_DOCKER_PASSWORD: 'password'
            }));
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

    it('builds and pushes docker image from Docker project, no existing matches', async () => {
        getCwdMock.mockImplementation(() => '/');
        syncMock.mockImplementationOnce(() => ({
            NEXUS_DOCKER_USER: 'abc',
            NEXUS_DOCKER_PASSWORD: 'def'
        }));
        runCommandMock.mockImplementation(() => E.right(''));

        const projectInfo: ProjectInfo = {
            ...baseProjectInfo,
            projectType: ProjectType.DockerImage,
            kubernetesDockerImage: undefined
        };
        const result = await dockerBuild(projectInfo)();
        expect(result).toEqualRight(projectInfo);

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
            'sudo docker image ls | grep craigmiller160.ddns.net:30004/my-project | grep 1.0.0 | cat'
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            3,
            'sudo docker build --network=host -t craigmiller160.ddns.net:30004/my-project:1.0.0 .',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            4,
            'sudo docker push craigmiller160.ddns.net:30004/my-project:1.0.0',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
    });

    it('builds and pushes docker image, no existing matches', async () => {
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
            'sudo docker image ls | grep craigmiller160.ddns.net:30004/my-project | grep 1.0.0 | cat'
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            3,
            'sudo docker build --network=host -t craigmiller160.ddns.net:30004/my-project:1.0.0 .',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            4,
            'sudo docker push craigmiller160.ddns.net:30004/my-project:1.0.0',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
    });

    it('builds and pushes docker image, with existing match', async () => {
        getCwdMock.mockImplementation(() => '/');
        syncMock.mockImplementationOnce(() => ({
            NEXUS_DOCKER_USER: 'abc',
            NEXUS_DOCKER_PASSWORD: 'def'
        }));
        runCommandMock.mockImplementation((command) => {
            if (/sudo docker image ls/.test(command)) {
                return E.right('Foo');
            }

            return E.right('');
        });

        const result = await dockerBuild(baseProjectInfo)();
        expect(result).toEqualRight(baseProjectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(5);
        expect(runCommandMock).toHaveBeenNthCalledWith(
            1,
            'sudo docker login craigmiller160.ddns.net:30004 -u abc -p def',
            {
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            2,
            'sudo docker image ls | grep craigmiller160.ddns.net:30004/my-project | grep 1.0.0 | cat'
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            3,
            'sudo docker image ls | grep craigmiller160.ddns.net:30004/my-project | grep 1.0.0 | awk \'{ print $3 }\' | xargs sudo docker image rm',
            {
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            4,
            'sudo docker build --network=host -t craigmiller160.ddns.net:30004/my-project:1.0.0 .',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            5,
            'sudo docker push craigmiller160.ddns.net:30004/my-project:1.0.0',
            {
                cwd: '/deploy',
                logOutput: true
            }
        );
    });

    describe('skip execution', () => {
        it('is library', async () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.NpmLibrary
            };
            const result = await dockerBuild(projectInfo)();
            expect(result).toEqualRight(projectInfo);

            expect(runCommandMock).not.toHaveBeenCalled();
        });
    });
});
