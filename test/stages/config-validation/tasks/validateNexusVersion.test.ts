import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import validateNexusVersion, { TASK_NAME } from '../../../../src/stages/config-validation/tasks/validateNexusVersion';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../src/error/BuildError';
import { STAGE_NAME } from '../../../../src/stages/config-validation';

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

    it('is release, lower than releases, higher than pre-releases', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: [],
            latestNexusVersions: {
                latestReleaseVersion: '2.0.0',
                latestPreReleaseVersion: '1.0.0-beta'
            }
        };
        const result = await validateNexusVersion(projectInfo)();
        expect(result).toEqualLeft(new BuildError(
            'Project version is not higher than versions in Nexus',
            STAGE_NAME,
            TASK_NAME
        ));

    });

    it('is pre-release, higher than all releases & pre-releases', () => {
        throw new Error();
    });

    it('is pre-release, higher than all releases, not pre-releases', () => {
        throw new Error();
    });

    it('is pre-release, lower than releases, higher than pre-releases', () => {
        throw new Error();
    });

    it('is release, no nexus versions', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: []
        };
        const result = await validateNexusVersion(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    it('is release, no release version, higher than pre-release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: [],
            latestNexusVersions: {
                latestPreReleaseVersion: '1.0.0-beta'
            }
        };
        const result = await validateNexusVersion(projectInfo)();
        console.log(result); // TODO delete this
        expect(result).toEqualRight(projectInfo);
    });

    it('is pre-release, has release version, no pre-release', async () => {
        throw new Error();
    });
});