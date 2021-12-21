import {
	downloadArtifact,
	restApiInstance,
	searchForDockerReleases,
	searchForMavenReleases,
	searchForMavenSnapshots,
	searchForNpmBetas,
	searchForNpmReleases
} from '../../../old-src/common/services/NexusRepoApi';
import MockAdapter from 'axios-mock-adapter';
import NexusSearchResult from '../../../old-src/types/NexusSearchResult';
import '@relmify/jest-fp-ts';
import fs from 'fs';
import tmp from 'tmp';
import axios from 'axios';

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
		mockRestApi
			.onGet(
				'/search?repository=maven-snapshots&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForMavenSnapshots(
			'io.craigmiller160',
			'My Name'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForMavenSnapshots with version', async () => {
		mockRestApi
			.onGet(
				'/search?repository=maven-snapshots&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc&maven.baseVersion=1'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForMavenSnapshots(
			'io.craigmiller160',
			'My Name',
			'1'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForMavenReleases', async () => {
		mockRestApi
			.onGet(
				'/search?repository=maven-releases&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForMavenReleases(
			'io.craigmiller160',
			'My Name'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForMavenReleases with version', async () => {
		mockRestApi
			.onGet(
				'/search?repository=maven-releases&maven.groupId=io.craigmiller160&maven.artifactId=My%20Name&sort=version&direction=desc&version=1'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForMavenReleases(
			'io.craigmiller160',
			'My Name',
			'1'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForNpmBetas', async () => {
		mockRestApi
			.onGet(
				'/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=true'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForNpmBetas(
			'craigmiller160',
			'My Name'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForNpmBetas with version', async () => {
		mockRestApi
			.onGet(
				'/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=true&version=1%2A'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForNpmBetas(
			'craigmiller160',
			'My Name',
			'1*'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForNpmReleases', async () => {
		mockRestApi
			.onGet(
				'/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=false'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForNpmReleases(
			'craigmiller160',
			'My Name'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('searchForNpmReleases with version', async () => {
		mockRestApi
			.onGet(
				'/search?format=npm&group=craigmiller160&name=My%20Name&sort=version&direction=desc&prerelease=false&version=1'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForNpmReleases(
			'craigmiller160',
			'My Name',
			'1'
		)();
		expect(actualResult).toEqualRight(expectedResult);
	});

	it('downloadArtifact', async () => {
		const input = tmp.tmpNameSync();
		const output = tmp.tmpNameSync();

		fs.writeFileSync(input, 'Hello World');
		const url = '/the/url';
		mockAxios.onGet(url).reply(200, fs.createReadStream(input));

		const result = await downloadArtifact(url, output)();
		expect(result).toEqualRight(output);
		expect(fs.readFileSync(output, 'utf8')).toEqual('Hello World');
	});

	it('searchForDockerReleases', async () => {
		mockRestApi
			.onGet(
				'/search?repository=docker-private&name=My%20Name&sort=version&direction=desc'
			)
			.reply(200, expectedResult);
		const actualResult = await searchForDockerReleases('My Name')();
		expect(actualResult).toEqualRight(expectedResult);
	});
});
