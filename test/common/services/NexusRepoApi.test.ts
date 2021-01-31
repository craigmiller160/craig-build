import { axiosInstance } from '../../../src/common/services/NexusRepoApi';
import MockAdapter from 'axios-mock-adapter';

const mockApi = new MockAdapter(axiosInstance);

describe('NexusRepoApi', () => {
    beforeEach(() => {
        mockApi.reset();
    });

    it('searchForMavenSnapshots', () => {
        throw new Error();
    });

    it('searchForMavenReleases', () => {
        throw new Error();
    });

    it('searchForNpmBetas', () => {
        throw new Error();
    });

    it('searchForNpmReleases', () => {
        throw new Error();
    });
});