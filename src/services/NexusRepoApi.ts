import axios from 'axios';
import { taskEither } from 'fp-ts';
import { function as func } from 'fp-ts';
import { NexusSearchResult } from './NexusSearchResult';
import qs from 'qs';
import { extractResponseData } from './apiUtils';
import fs from 'fs';
import { unknownToError } from '../functions/unknownToError';
import { streamTask } from '../utils/streamTask';
import { logger } from '../logger';

const sort = 'version';
const direction = 'desc';

export const restApiInstance = axios.create({
	baseURL: 'https://nexus-craigmiller160.ddns.net/service/rest/v1'
});
restApiInstance.interceptors.request.use((config) => {
	const request = `${config.method?.toUpperCase()} ${config.url}`;
	logger.debug(`Nexus Request: ${request}`);
	return config;
});

export type NexusRepoGroupSearchFn = (
	group: string,
	name: string,
	version?: string
) => taskEither.TaskEither<Error, NexusSearchResult>;

export const searchForMavenSnapshots: NexusRepoGroupSearchFn = (
	groupId: string,
	artifactId: string,
	version?: string
) =>
	func.pipe(
		taskEither.tryCatch(() => {
			const query = qs.stringify({
				repository: 'maven-snapshots',
				'maven.groupId': groupId,
				'maven.artifactId': artifactId,
				sort,
				direction,
				'maven.baseVersion': version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, unknownToError),
		extractResponseData
	);

export const searchForMavenSnapshotsExplicit: NexusRepoGroupSearchFn = (
	groupId: string,
	artifactId: string,
	version?: string
) =>
	func.pipe(
		taskEither.tryCatch(() => {
			const query = qs.stringify({
				repository: 'maven-snapshots',
				'maven.groupId': groupId,
				'maven.artifactId': artifactId,
				sort,
				direction,
				version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, unknownToError),
		extractResponseData
	);

export const searchForMavenReleases: NexusRepoGroupSearchFn = (
	groupId: string,
	artifactId: string,
	version?: string
) =>
	func.pipe(
		taskEither.tryCatch(() => {
			const query = qs.stringify({
				repository: 'maven-releases',
				'maven.groupId': groupId,
				'maven.artifactId': artifactId,
				sort,
				direction,
				version
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, unknownToError),
		extractResponseData
	);

export const searchForNpmBetas: NexusRepoGroupSearchFn = (
	group: string,
	name: string,
	version?: string
) =>
	func.pipe(
		taskEither.tryCatch(() => {
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
		}, unknownToError),
		extractResponseData
	);

export const searchForNpmReleases: NexusRepoGroupSearchFn = (
	group: string,
	name: string,
	version?: string
) =>
	func.pipe(
		taskEither.tryCatch(() => {
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
		}, unknownToError),
		extractResponseData
	);

export const searchForDockerReleases = (name: string) =>
	func.pipe(
		taskEither.tryCatch(() => {
			const query = qs.stringify({
				repository: 'docker-private',
				name,
				sort,
				direction
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, unknownToError),
		extractResponseData
	);

export const searchForDockerBetas = (name: string, version?: string) =>
	func.pipe(
		taskEither.tryCatch(() => {
			const query = qs.stringify({
				repository: 'docker-private',
				name,
				sort,
				direction,
				version: version ?? '*beta*'
			});
			return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
		}, unknownToError),
		extractResponseData
	);

export const downloadArtifact = (
	url: string,
	targetPath: string
): taskEither.TaskEither<Error, string> =>
	func.pipe(
		taskEither.tryCatch(
			() =>
				axios.get(url, {
					responseType: 'stream'
				}),
			unknownToError
		),
		taskEither.chain((res) =>
			streamTask(res.data.pipe(fs.createWriteStream(targetPath)))
		),
		taskEither.map(() => targetPath)
	);
