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
    it('bumps beta version', async () => {
        const result = await bumpNpmBeta(baseProjectInfo)();
        expect(result).toEqualRight({
            ...baseProjectInfo,
            version: '1.0.0-beta.2'
        });
    });

    it('bumps beta version when there is no beta number', async () => {
        const projectInfo: ProjectInfo = {
            ...baseProjectInfo,
            version: '1.0.0-beta'
        };
        const result = await bumpNpmBeta(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            version: '1.0.0-beta.1'
        });
    });
});