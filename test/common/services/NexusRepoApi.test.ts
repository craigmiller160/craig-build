import {
    downloadArtifact,
    restApiInstance,
    searchForMavenReleases,
    searchForMavenSnapshots, searchForNpmBetas, searchForNpmReleases
} from '../../../src/common/services/NexusRepoApi';
import MockAdapter from 'axios-mock-adapter';
import NexusSearchResult from '../../../src/types/NexusSearchResult';
import '@relmify/jest-fp-ts';
import fs from 'fs';
import tmp from 'tmp';
import axios from 'axios';
import path from 'path';

const mockRestApi = new MockAdapter(restApiInstance);
const mockAxios = new MockAdapter(axios);

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
        mockRestApi.reset();
    });

    it('searchForMavenSnapshots', async () => {
        mockRestApi.onGet('/search?repository=maven-snapshots&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc')
            .reply(200, expectedResult);
        const actualResult = await searchForMavenSnapshots('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('searchForMavenReleases', async () => {
        mockRestApi.onGet('/search?repository=maven-releases&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc')
            .reply(200, expectedResult);
        const actualResult = await searchForMavenReleases('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('searchForNpmBetas', async () => {
        mockRestApi.onGet('/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=true')
            .reply(200, expectedResult);
        const actualResult = await searchForNpmBetas('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('searchForNpmReleases', async () => {
        mockRestApi.onGet('/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=false')
            .reply(200, expectedResult);
        const actualResult = await searchForNpmReleases('My Name')();
        expect(actualResult).toEqualRight(expectedResult);
    });

    it('experiment', (done) => {
        // TODO delete this
        const input = tmp.tmpNameSync();
        const output = tmp.tmpNameSync();

        fs.writeFileSync(input, 'Hello World');

        const stream = fs.createReadStream(input)
            .pipe(fs.createWriteStream(output));
        stream.on('finish', () => {
            console.log(fs.readFileSync(output, 'utf8'));
            done();
        });
    });

    it('downloadArtifact', async () => {
        // fs.writeFileSync(inputData, 'Hello World');
        //
        // const url = '/the/url';
        // mockAxios.onGet(url)
        //     .reply(200, fs.createReadStream(inputData));
        //
        // const result = await downloadArtifact(url, outputData)();
        // expect(result).toEqualRight(outputData);
        // expect(fs.readFileSync(outputData, 'utf8')).toEqual('Hello World');
        throw new Error();
    });
});