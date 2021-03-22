import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import validateNexusVersion, { TASK_NAME } from '../../../src/common/tasks/validateNexusVersion';
import '@relmify/jest-fp-ts';
import BuildError from '../../../src/error/BuildError';
import stageName from '../../../src/stages/config-validation/stageName';
import { DEPLOY_ONLY_BUILD } from "../../../src/execution/executionConstants";

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
        const result = await validateNexusVersion(stageName)(projectInfo)();
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
        const result = await validateNexusVersion(stageName)(projectInfo)();
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
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualLeft(new BuildError(
            'Project version is not higher than versions in Nexus',
            stageName,
            TASK_NAME
        ));
    });

    it('is pre-release, higher than all releases & pre-releases', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: true,
            name: 'my-project',
            version: '1.1.0-beta',
            dependencies: [],
            latestNexusVersions: {
                latestPreReleaseVersion: '1.0.0-beta',
                latestReleaseVersion: '1.0.0'
            }
        };
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    it('is pre-release, higher than all releases and equal to pre-release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: true,
            name: 'my-project',
            version: '1.1.0-beta',
            dependencies: [],
            latestNexusVersions: {
                latestPreReleaseVersion: '1.1.0-beta.1',
                latestReleaseVersion: '1.0.0'
            }
        };
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    it('is pre-release, higher than all releases, not pre-releases', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: true,
            name: 'my-project',
            version: '1.1.0-beta',
            dependencies: [],
            latestNexusVersions: {
                latestPreReleaseVersion: '1.2.0-beta.1',
                latestReleaseVersion: '1.0.0'
            }
        };
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualLeft(new BuildError(
            'Project version is not higher than versions in Nexus',
            stageName,
            TASK_NAME
        ));
    });

    it('is pre-release, lower than releases, higher than pre-releases', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: true,
            name: 'my-project',
            version: '1.1.0-beta',
            dependencies: [],
            latestNexusVersions: {
                latestPreReleaseVersion: '1.0.0-beta.1',
                latestReleaseVersion: '1.2.0'
            }
        };
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualLeft(new BuildError(
            'Project version is not higher than versions in Nexus',
            stageName,
            TASK_NAME
        ));
    });

    it('is release, no nexus versions', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.1.0',
            dependencies: []
        };
        const result = await validateNexusVersion(stageName)(projectInfo)();
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
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    it('is pre-release, has release version, no pre-release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: true,
            name: 'my-project',
            version: '1.1.0-beta',
            dependencies: [],
            latestNexusVersions: {
                latestReleaseVersion: '1.0.0'
            }
        };
        const result = await validateNexusVersion(stageName)(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    describe('skips execution', () => {
        it('deploy only build', async () => {
            process.env.BUILD_NAME = DEPLOY_ONLY_BUILD;
            const projectInfo: ProjectInfo = {
                projectType: ProjectType.NpmLibrary,
                isPreRelease: true,
                name: 'my-project',
                version: '1.1.0-beta',
                dependencies: [],
                latestNexusVersions: {
                    latestPreReleaseVersion: '1.0.0-beta.1',
                    latestReleaseVersion: '1.2.0'
                }
            };
            const result = await validateNexusVersion(stageName)(projectInfo)();
            expect(result).toEqualRight(projectInfo);
        });

        it('is docker pre-release', async () => {
            const projectInfo: ProjectInfo = {
                projectType: ProjectType.DockerImage,
                isPreRelease: true,
                name: 'my-project',
                version: 'latest',
                dependencies: []
            };
            const result = await validateNexusVersion(stageName)(projectInfo)();
            expect(result).toEqualRight(projectInfo);
        });
    });
});