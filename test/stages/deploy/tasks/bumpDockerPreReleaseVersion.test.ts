import {searchForMavenSnapshots} from '../../../../src/common/services/NexusRepoApi';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import bumpDockerPreReleaseVersion from '../../../../src/stages/deploy/tasks/bumpDockerPreReleaseVersion';
import NexusSearchResult from '../../../../src/types/NexusSearchResult';
import '@relmify/jest-fp-ts';

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    searchForMavenSnapshots: jest.fn()
}));

const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;

const baseProjectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    group: 'craigmiller160',
    name: 'my-project',
    version: '1.0.0-beta.1',
    isPreRelease: true,
    dependencies: []
};

describe('bumpDockerPreReleaseVersion', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('bumps docker pre-release version for NPM', async () => {
        const result = await bumpDockerPreReleaseVersion(baseProjectInfo)();
        expect(result).toEqualRight({
            ...baseProjectInfo,
            dockerPreReleaseVersion: '1.0.0-beta.1'
        });
    });

    it('bumps docker pre-release version for Maven', async () => {
        const response: NexusSearchResult = {
            items: [
                {
                    id: '',
                    repository: '',
                    group: 'craigmiller160',
                    name: 'my-project',
                    assets: [],
                    format: 'maven2',
                    version: '1.0.0-20211214.215625-13'
                }
            ]
        };
        searchForMavenSnapshotsMock.mockImplementation(() => TE.right(response));
        const projectInfo: ProjectInfo = {
            ...baseProjectInfo,
            projectType: ProjectType.MavenApplication
        };
        const result = await bumpDockerPreReleaseVersion(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            dockerPreReleaseVersion: '1.0.0-20211214.215625-13'
        });
        expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith(projectInfo.group, projectInfo.name);
    });

    it('cannot find existing pre-release version for Maven', async () => {
        throw new Error();
    });

    it('bumps docker pre-release version for Docker', async () => {
        throw new Error();
    });

    describe('skip execution', () => {
        it('is not docker, application, or pre-release', async () => {
            throw new Error();
        });

        it('is pre-release docker', async () => {
            throw new Error();
        });

        it('is release docker', async () => {
            throw new Error();
        });

        it('is pre-release non-docker application', async () => {
            throw new Error();
        });

        it('is release non-docker application', async () => {
            throw new Error();
        });
    });
});