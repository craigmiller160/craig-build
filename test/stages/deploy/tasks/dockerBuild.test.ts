import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import runCommand from '../../../../src/utils/runCommand';
import dockerBuild, { TASK_NAME } from '../../../../src/stages/deploy/tasks/dockerBuild';
import BuildError from '../../../../src/error/BuildError';
import { STAGE_NAME } from '../../../../src/stages/deploy';
import getCwd from '../../../../src/utils/getCwd';

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

describe('dockerBuild task', () => {
    describe('validations',  () => {
        it('has no kubernetesDockerImage', async () => {
            getCwdMock.mockImplementation(() => '');
            const result = await dockerBuild({
                ...baseProjectInfo,
                kubernetesDockerImage: undefined
            })();
            expect(result).toEqualLeft(new BuildError('Missing Kubernetes Docker Image', STAGE_NAME, TASK_NAME));
        });

        it('has no docker username', () => {
            throw new Error();
        });

        it('has no docker password', () => {
            throw new Error();
        });
    });

    it('builds and pushes docker image', () => {
        throw new Error();
    });
});
