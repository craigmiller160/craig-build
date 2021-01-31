import axios from 'axios';
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/pipeable';
import handleUnknownError from '../../utils/handleUnknownError';
import NexusSearchResult from '../../types/NexusSearchResult';
import qs from 'qs';
import { extractResponseData } from './apiUtils';

const mavenGroupId = 'io.craigmiller160';
const npmGroup = 'craigmiller160';
const sort = 'version';
const direction = 'desc';

export const axiosInstance = axios.create({
    baseURL: 'https://craigmiller160.ddns.net:30003/service/rest/v1'
});

// TODO write unit tests for this

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
                return axiosInstance.get<NexusSearchResult>(`/search?${query}`);
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
                return axiosInstance.get<NexusSearchResult>(`/search?${query}`);
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
                return axiosInstance.get<NexusSearchResult>(`/search?${query}`);
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
                return axiosInstance.get<NexusSearchResult>(`/search?${query}`);
            },
            handleUnknownError
        ),
        extractResponseData
    );