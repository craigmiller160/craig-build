import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';

describe('validateNexusVersion task', () => {
    it('is release, higher than all releases & pre-releases', () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: []
        }
        throw new Error();
    });

    it('is release, higher than all releases, not pre-releases', () => {
        throw new Error();
    });

    it('is pre-release, higher than all releases & pre-releases', () => {
        throw new Error();
    });

    it('is pre-release, higher than all releases, not pre-releases', () => {
        throw new Error();
    });

    it('no nexus versions', () => {
        throw new Error();
    });

    it('is release, no release version, higher than pre-release', () => {
        throw new Error();
    });

    it('is pre-release, has release version, no pre-release', () => {
        throw new Error();
    });
});