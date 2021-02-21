import {
    restApiInstance,
    searchForMavenReleases,
    searchForMavenSnapshots, searchForNpmBetas, searchForNpmReleases
} from '../../../src/common/services/NexusRepoApi';
import MockAdapter from 'axios-mock-adapter';
import NexusSearchResult from '../../../src/types/NexusSearchResult';
import '@relmify/jest-fp-ts';

const mockApi = new MockAdapter(restApiInstance);

const expectedResult: NexusSearchResult = {
    items: [
        {
            id: 'ABCDEFG',
            repository: 'My Repo',
            format: 'My Format',
            group: 'My Group',
            name: 'My Name',
            version: '1.0.0',
            assets: []
        }
    ]
};

describe('NexusRepoApi', () => {
    beforeEach(() => {
        mockApi.reset();
    });

    it('searchForMavenSnapshots', async () => {
        mockApi.onGet('/search?repository=maven-snapshots&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc')
            .reply(200, expectedResult);
        const actualResult = await searchForMavenSnapshots('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('searchForMavenReleases', async () => {
        mockApi.onGet('/search?repository=maven-releases&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc')
            .reply(200, expectedResult);
        const actualResult = await searchForMavenReleases('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('searchForNpmBetas', async () => {
        mockApi.onGet('/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=true')
            .reply(200, expectedResult);
        const actualResult = await searchForNpmBetas('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('searchForNpmReleases', async () => {
        mockApi.onGet('/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=false')
            .reply(200, expectedResult);
        const actualResult = await searchForNpmReleases('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('downloadArtifact', async () => {
        throw new Error();
    });
});