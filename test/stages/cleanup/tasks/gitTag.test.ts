import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import gitTag from '../../../../src/stages/cleanup/tasks/gitTag';
import runCommand from '../../../../src/utils/runCommand';
import * as E from 'fp-ts/Either';
import {DEPLOY_ONLY_BUILD} from "../../../../src/execution/executionConstants";

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
        it('is not release', async () => {
            const newProjectInfo: ProjectInfo = {
                ...projectInfo,
                isPreRelease: true
            };

            const result = await gitTag(newProjectInfo)();
            expect(result).toEqualRight(newProjectInfo);
            expect(runCommandMock).not.toHaveBeenCalled();
        });

        it('is deploy-only build', async () => {
            process.env.BUILD_NAME = DEPLOY_ONLY_BUILD;
            const result = await gitTag(projectInfo)();
            expect(result).toEqualRight(projectInfo);
            expect(runCommandMock).not.toHaveBeenCalled();
        });
    });
});