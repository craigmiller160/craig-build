import runCommand from '../../../../src/utils/runCommand';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import publish, { NPM_PUBLISH_COMMAND } from '../../../../src/stages/createArtifact/tasks/publish';
import '@relmify/jest-fp-ts';
import * as E from 'fp-ts/Either';

const runCommandMock = runCommand as jest.Mock;

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

        const result = await publish(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock)
            .toHaveBeenCalledWith(`${NPM_PUBLISH_COMMAND} ${projectInfo.version}`, {
                logOutput: true
            });
    });
});