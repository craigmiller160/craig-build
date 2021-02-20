import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import bumpNpmBeta from '../../../../src/stages/createArtifact/tasks/bumpNpmBeta';
import '@relmify/jest-fp-ts';

const baseProjectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    isPreRelease: true,
    name: 'my-project',
    version: '1.0.0-beta.1',
    dependencies: []
};

describe('bumpNpmBeta task', () => {
    it('bumps npm beta with nexus pre-release version', () => {
        throw new Error();
    });

    it('bumps npm beta with no nexus pre-release version', () => {
        throw new Error();
    });
});