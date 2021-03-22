import runCommand from '../../../../src/utils/runCommand';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import publish, { NPM_PUBLISH_COMMAND } from '../../../../src/stages/createArtifact/tasks/publish';
import '@relmify/jest-fp-ts';
import * as E from 'fp-ts/Either';
import simpleGit from 'simple-git';

jest.mock('simple-git', () => {
    const checkout = jest.fn();
    return () => ({
        checkout
    });
})

const runCommandMock = runCommand as jest.Mock;
const checkoutMock = simpleGit().checkout as jest.Mock;

describe('publish task', () => {
    it('publishes NPM package', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmApplication,
            isPreRelease: false,
            name: 'my-project',
            version: '1.0.0',
            dependencies: []
        };

        runCommandMock.mockImplementation(() => E.of(''));
        checkoutMock.mockResolvedValue('');

        const result = await publish(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(1);
        expect(runCommandMock)
            .toHaveBeenNthCalledWith(1, `${NPM_PUBLISH_COMMAND} ${projectInfo.version}`, {
                logOutput: true
            });
        expect(checkoutMock).toHaveBeenCalledWith('.');
    });

    describe('skip execution', () => {
        it('is maven project', async () => {
            const projectInfo: ProjectInfo = {
                projectType: ProjectType.MavenApplication,
                isPreRelease: false,
                name: 'my-project',
                version: '1.0.0',
                dependencies: []
            };
            const result = await publish(projectInfo)();
            expect(result).toEqualRight(projectInfo);

            expect(runCommandMock).not.toHaveBeenCalled();
        });
    });
});