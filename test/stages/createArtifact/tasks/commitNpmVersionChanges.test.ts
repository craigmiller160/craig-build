import runCommand from '../../../../src/utils/runCommand';
import * as E from 'fp-ts/Either';
import '@relmify/jest-fp-ts';
import commitNpmVersionChanges, {
    ADD_PACKAGE_JSON_IF_CHANGED, CHECK_IF_PACKAGE_JSON_CHANGED, GIT_COMMIT, GIT_PUSH,
    RESET_GIT_STAGING
} from '../../../../src/stages/createArtifact/tasks/commitNpmVersionChanges';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';

const runCommandMock = runCommand as jest.Mock;

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    isPreRelease: true,
    name: 'my-project',
    version: '1.0.0-beta',
    dependencies: []
};

describe('commitNpmVersionChanges', () => {
    it('commits package.json changes', async () => {
        runCommandMock.mockImplementationOnce(() => E.right(''));
        runCommandMock.mockImplementationOnce(() => E.right(''));
        runCommandMock.mockImplementationOnce(() => E.right('M package.json'));
        runCommandMock.mockImplementationOnce(() => E.right(''));
        runCommandMock.mockImplementationOnce(() => E.right(''));

        const result = await commitNpmVersionChanges(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(5);
        expect(runCommandMock).toHaveBeenNthCalledWith(1, RESET_GIT_STAGING);
        expect(runCommandMock).toHaveBeenNthCalledWith(2, ADD_PACKAGE_JSON_IF_CHANGED);
        expect(runCommandMock).toHaveBeenNthCalledWith(3, CHECK_IF_PACKAGE_JSON_CHANGED);
        expect(runCommandMock).toHaveBeenNthCalledWith(4, GIT_COMMIT, true);
        expect(runCommandMock).toHaveBeenNthCalledWith(5, GIT_PUSH, true);
    });

    it('no package.json changes to commit', async () => {
        runCommandMock.mockImplementationOnce(() => E.right(''));
        runCommandMock.mockImplementationOnce(() => E.right(''));
        runCommandMock.mockImplementationOnce(() => E.right(''));

        const result = await commitNpmVersionChanges(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(3);
        expect(runCommandMock).toHaveBeenNthCalledWith(1, RESET_GIT_STAGING);
        expect(runCommandMock).toHaveBeenNthCalledWith(2, ADD_PACKAGE_JSON_IF_CHANGED);
        expect(runCommandMock).toHaveBeenNthCalledWith(3, CHECK_IF_PACKAGE_JSON_CHANGED);
    });
});
