import axios from 'axios';
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/pipeable';
import handleUnknownError from '../../utils/handleUnknownError';
import NexusSearchResult from '../../types/NexusSearchResult';
import qs from 'qs';
import { extractResponseData } from './apiUtils';
import fs from 'fs';
import streamPromisify from '../../utils/streamPromisify';

const mavenGroupId = 'io.craigmiller160';
const npmGroup = 'craigmiller160';
const sort = 'version';
const direction = 'desc';

export const restApiInstance = axios.create({
    baseURL: 'https://craigmiller160.ddns.net:30003/service/rest/v1'
});

export type NexusRepoSearchFn = (name: string) => TE.TaskEither<Error, NexusSearchResult>;

export const searchForMavenSnapshots = (artifactId: string): TE.TaskEither<Error, NexusSearchResult> =>
    pipe(
        TE.tryCatch(
            () => {
                const query = qs.stringify({
                    repository: 'maven-snapshots',
                    'maven.groupId': mavenGroupId,
                    'maven.artifactId': artifactId,
                    sort,
                    direction
                });
                return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
            },
            handleUnknownError
        ),
        extractResponseData
    );

export const searchForMavenReleases = (artifactId: string): TE.TaskEither<Error, NexusSearchResult> =>
    pipe(
        TE.tryCatch(
            () => {
                const query = qs.stringify({
                    repository: 'maven-releases',
                    'maven.groupId': mavenGroupId,
                    'maven.artifactId': artifactId,
                    sort,
                    direction
                });
                return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
            },
            handleUnknownError
        ),
        extractResponseData
    );

export const searchForNpmBetas = (name: string): TE.TaskEither<Error, NexusSearchResult> =>
    pipe(
        TE.tryCatch(
            () => {
                const query = qs.stringify({
                    format: 'npm',
                    group: npmGroup,
                    name,
                    sort,
                    direction,
                    prerelease: true
                });
                return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
            },
            handleUnknownError
        ),
        extractResponseData
    );

export const searchForNpmReleases = (name: string): TE.TaskEither<Error, NexusSearchResult> =>
    pipe(
        TE.tryCatch(
            () => {
                const query = qs.stringify({
                    format: 'npm',
                    group: npmGroup,
                    name,
                    sort,
                    direction,
                    prerelease: false
                });
                return restApiInstance.get<NexusSearchResult>(`/search?${query}`);
            },
            handleUnknownError
        ),
        extractResponseData
    );

export const downloadArtifact = (url: string, targetPath: string): TE.TaskEither<Error, string> =>
    pipe(
        TE.tryCatch(
            () => axios.get(url, {
                responseType: 'stream'
            }),
            handleUnknownError
        ),
        TE.chain((res) => TE.tryCatch(
            () => streamPromisify(res.data.pipe(fs.createWriteStream(targetPath))),
            handleUnknownError
        )),
        TE.map(() => targetPath)
    );