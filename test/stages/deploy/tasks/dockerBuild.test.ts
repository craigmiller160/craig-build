import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';

const baseProjectInfo: ProjectInfo = {
    projectType: ProjectType.MavenApplication,
    isPreRelease: false,
    name: 'my-project',
    version: '1.0.0',
    kubernetesDockerImage: 'my-project:1.0.0',
    dependencies: []
};

describe('dockerBuild task', () => {
    describe('validations', () => {
        it('has no kubernetesDockerImage', () => {
            throw new Error();
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
