import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import bumpNpmBeta from '../../../../src/stages/createArtifact/tasks/bumpNpmBeta';
import '@relmify/jest-fp-ts';

const baseProjectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    isPreRelease: true,
    name: 'my-project',
    version: '1.0.0-beta',
    dependencies: []
};

describe('bumpNpmBeta task', () => {
    it('bumps npm beta with nexus pre-release version', async () => {
        const projectInfo: ProjectInfo = {
            ...baseProjectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: '1.0.0-beta.2'
            }
        };
        const result = await bumpNpmBeta(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            version: '1.0.0-beta.3'
        });
    });

    it('bumps npm beta with no nexus pre-release version', async () => {
        const result = await bumpNpmBeta(baseProjectInfo)();
        expect(result).toEqualRight({
            ...baseProjectInfo,
            version: '1.0.0-beta.1'
        });
    });

    it('bumps npm beta when local beta higher than nexus beta', async () => {
        const projectInfo: ProjectInfo = {
            ...baseProjectInfo,
            version: '1.1.0-beta',
            latestNexusVersions: {
                latestPreReleaseVersion: '1.0.0-beta.1'
            }
        };

        const expected: ProjectInfo = {
            ...projectInfo,
            version: '1.1.0-beta.1'
        };
        const result = await bumpNpmBeta(projectInfo)();
        expect(result).toEqualRight(expected);
    });

    describe('skip execution', () => {
        it('is maven project', async () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.MavenApplication
            };
            const result = await bumpNpmBeta(projectInfo)();
            expect(result).toEqualRight(projectInfo);
        });

        it('is release version', async () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                isPreRelease: false,
                version: '1.0.0'
            };
            const result = await bumpNpmBeta(projectInfo)();
            expect(result).toEqualRight(projectInfo);
        });
    });
});