import axios from 'axios';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import handleUnknownError from '../../utils/handleUnknownError';
import NexusSearchResult from '../../types/NexusSearchResult';
import qs from 'qs';
import { extractResponseData } from './apiUtils';
import fs from 'fs';
import streamPromisify from '../../utils/streamPromisify';

const sort = 'version';
const direction = 'desc';

export const restApiInstance = axios.create({
	baseURL: 'https://craigmiller160.ddns.net:30003/service/rest/v1'
});

export type NexusRepoGroupSearchFn = (
	group: string,
	name: string,
	version?: string
) => TE.TaskEither<Error, NexusSearchResult>;

export const searchForMavenSnapshots: NexusRepoGroupSearchFn = (
	groupId: string,
	artifactId: string,
	version?: string
) =>
	pipe(
		TE.tryCatch(() => {
			const query = qs.stringify({
				repository: 'maven-snapshots',
				'maven.groupId': groupId,
				'maven.artifactId': artifactId,
				sort,
				direction,
				'maven.baseVersion': version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, handleUnknownError),
		extractResponseData
	);

export const searchForMavenReleases: NexusRepoGroupSearchFn = (
	groupId: string,
	artifactId: string,
	version?: string
) =>
	pipe(
		TE.tryCatch(() => {
			const query = qs.stringify({
				repository: 'maven-releases',
				'maven.groupId': groupId,
				'maven.artifactId': artifactId,
				sort,
				direction,
				version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, handleUnknownError),
		extractResponseData
	);

export const searchForNpmBetas: NexusRepoGroupSearchFn = (
	group: string,
	name: string,
	version?: string
) =>
	pipe(
		TE.tryCatch(() => {
			const query = qs.stringify({
				format: 'npm',
				group,
				name,
				sort,
				direction,
				prerelease: true,
				version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, handleUnknownError),
		extractResponseData
	);

export const searchForNpmReleases: NexusRepoGroupSearchFn = (
	group: string,
	name: string,
	version?: string
) =>
	pipe(
		TE.tryCatch(() => {
			const query = qs.stringify({
				format: 'npm',
				group,
				name,
				sort,
				direction,
				prerelease: false,
				version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, handleUnknownError),
		extractResponseData
	);

export const searchForDockerReleases = (name: string) =>
	pipe(
		TE.tryCatch(() => {
			const query = qs.stringify({
				repository: 'docker-private',
				name,
				sort,
				direction
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, handleUnknownError),
		extractResponseData
	);

export const downloadArtifact = (
	url: string,
	targetPath: string
): TE.TaskEither<Error, string> =>
	pipe(
		TE.tryCatch(
			() =>
				axios.get(url, {
					responseType: 'stream'
				}),
			handleUnknownError
		),
		TE.chain((res) =>
			TE.tryCatch(
				() =>
					streamPromisify(
						res.data.pipe(fs.createWriteStream(targetPath))
					),
				handleUnknownError
			)
		),
		TE.map(() => targetPath)
	);
