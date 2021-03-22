import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import gitTag from '../../../../src/stages/cleanup/tasks/gitTag';
import runCommand from '../../../../src/utils/runCommand';
import * as E from 'fp-ts/Either';

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    isPreRelease: false,
    name: 'my-project',
    version: '1.0.0',
    dependencies: []
};

const runCommandMock = runCommand as jest.Mock;

describe('gitTag task', () => {
    it('creates and pushes tag', async () => {
        runCommandMock.mockImplementation(() => E.right(''));
        const result = await gitTag(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(2);
        expect(runCommandMock).toHaveBeenNthCalledWith(1, 'git tag v1.0.0');
        expect(runCommandMock).toHaveBeenNthCalledWith(2, 'git push --tags');
    });

    describe('skip execution', () => {
        it('is not release', () => {
            throw new Error();
        });

        it('is deploy-only build', () => {
            throw new Error();
        });
    });
});