import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import { downloadArtifact as downloadArtifactService } from '../../../../src/common/services/NexusRepoApi';

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    downloadArtifact: jest.fn()
}));

const downloadArtifactServiceMock = downloadArtifactService as jest.Mock;

describe('downloadArtifact task', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('downloads maven pre-release', () => {
        throw new Error();
    });

    it('downloads maven release', () => {
        throw new Error();
    });
});
