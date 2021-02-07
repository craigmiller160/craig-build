import runCommand from '../../../../src/utils/runCommand';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import buildAndTest, { MAVEN_BUILD_CMD, NPM_BUILD_CMD } from '../../../../src/stages/createArtifact/tasks/buildAndTest';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';

const runCommandMock = runCommand as jest.Mock;

const createProjectInfo = (projectType: ProjectType): ProjectInfo => ({
    projectType,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
});

describe('buildAndTest task', () => {
    beforeEach(() => {
        runCommandMock.mockImplementation(() => TE.of(''));
    });

    it('runs NPM build', async () => {
        const projectInfo = createProjectInfo(ProjectType.NpmLibrary);
        const result = await buildAndTest(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledWith(NPM_BUILD_CMD, true);
    });

    it('runs Maven build', async () => {
        const projectInfo = createProjectInfo(ProjectType.MavenLibrary);
        const result = await buildAndTest(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledWith(MAVEN_BUILD_CMD, true);
    });
});