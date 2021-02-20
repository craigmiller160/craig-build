import '@relmify/jest-fp-ts';
import buildAndTest from '../../../src/stages/createArtifact/tasks/buildAndTest';
import bumpNpmBeta from '../../../src/stages/createArtifact/tasks/bumpNpmBeta';
import publish from '../../../src/stages/createArtifact/tasks/publish';
import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import createArtifact from '../../../src/stages/createArtifact';
import * as TE from 'fp-ts/TaskEither';

jest.mock('../../../src/stages/createArtifact/tasks/buildAndTest', () => jest.fn());
jest.mock('../../../src/stages/createArtifact/tasks/bumpNpmBeta', () => jest.fn());
jest.mock('../../../src/stages/createArtifact/tasks/publish', () => jest.fn());

const buildAndTestMock = buildAndTest as jest.Mock;
const bumpNpmBetaMock = bumpNpmBeta as jest.Mock;
const publishMock = publish as jest.Mock;

describe('build stage', () => {
    it('completes successfully', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmApplication,
            name: 'my-project',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: []
        };

        buildAndTestMock.mockImplementationOnce(() => TE.right(projectInfo));
        bumpNpmBetaMock.mockImplementationOnce(() => TE.right(projectInfo));
        publishMock.mockImplementationOnce(() => TE.right(projectInfo));

        const result = await createArtifact(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(buildAndTestMock).toHaveBeenCalledWith(projectInfo);
        expect(bumpNpmBetaMock).toHaveBeenCalledWith(projectInfo);
        expect(publishMock).toHaveBeenCalledWith(projectInfo);
    });
});