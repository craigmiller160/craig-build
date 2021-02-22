import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import {
    downloadArtifact as downloadArtifactService, searchForMavenReleases,
    searchForMavenSnapshots
} from '../../../../src/common/services/NexusRepoApi';
import path from 'path';
import fs from 'fs';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import downloadArtifact from '../../../../src/stages/deploy/tasks/downloadArtifact';
import getCwd from '../../../../src/utils/getCwd';
import NexusSearchResult from '../../../../src/types/NexusSearchResult';

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    searchForMavenSnapshots: jest.fn(),
    searchForMavenReleases: jest.fn(),
    downloadArtifact: jest.fn()
}));

const getCwdMock = getCwd as jest.Mock;
const downloadArtifactServiceMock = downloadArtifactService as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;

const workingDirs = path.resolve(process.cwd(), 'test', '__working-dirs__');
const mavenReleaseWorkDir = path.resolve(workingDirs, 'mavenReleaseApplication');
const mavenReleaseBuildDir = path.resolve(mavenReleaseWorkDir, 'deploy', 'build');
const mavenPreReleaseWorkDir = path.resolve(workingDirs, 'mavenSnapshotApplication');
const mavenPreReleaseBuildDir = path.resolve(mavenPreReleaseWorkDir, 'deploy', 'build');

const cleanDirs = () => {
    if (fs.existsSync(mavenReleaseBuildDir)) {
        fs.rmdirSync(mavenReleaseBuildDir, { recursive: true });
    }

    if (fs.existsSync(mavenPreReleaseBuildDir)) {
        fs.rmdirSync(mavenPreReleaseBuildDir, { recursive: true });
    }
};

const downloadUrl = '/the/url';

const searchResult: NexusSearchResult = {
    items: [
        {
            id: '1',
            repository: 'repo',
            format: 'format',
            group: 'group',
            name: 'name',
            version: 'version',
            assets: [
                {
                    downloadUrl,
                    path: 'path',
                    id: 'id'
                }
            ]
        }
    ]
};

describe('downloadArtifact task', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        cleanDirs();
    });

    afterEach(() => {
        cleanDirs();
    });

    it('downloads maven pre-release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.MavenApplication,
            name: 'my-project',
            version: '1.0.0-SNAPSHOT',
            isPreRelease: true,
            dependencies: []
        };

        getCwdMock.mockImplementation(() => mavenPreReleaseWorkDir);
        downloadArtifactServiceMock.mockImplementation(() => TE.right(''));
        searchForMavenSnapshotsMock.mockImplementation(() => TE.right(searchResult));

        const result = downloadArtifact(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        throw new Error();
    });

    it('downloads maven release', () => {
        throw new Error();
    });
});
