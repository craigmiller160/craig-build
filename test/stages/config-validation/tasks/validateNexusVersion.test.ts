import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import validateNexusVersion from '../../../../src/stages/config-validation/tasks/validateNexusVersion';
import '@relmify/jest-fp-ts';

describe('validateNexusVersion task', () => {
    it('is release, higher than all releases & pre-releases', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: [],
            latestNexusVersions: {
                latestReleaseVersion: '1.0.0',
                latestPreReleaseVersion: '1.0.0-beta'
            }
        };
        const result = await validateNexusVersion(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    it('is release, higher than all releases, not pre-releases', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: [],
            latestNexusVersions: {
                latestReleaseVersion: '1.0.0',
                latestPreReleaseVersion: '2.0.0-beta'
            }
        };
        const result = await validateNexusVersion(projectInfo)();
        expect(result).toEqualRight(projectInfo);
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