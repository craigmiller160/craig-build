import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import {
    downloadArtifact as downloadArtifactApi,
    searchForMavenReleases,
    searchForMavenSnapshots, searchForNpmBetas, searchForNpmReleases
} from '../../../../src/common/services/NexusRepoApi';
import path from 'path';
import fs from 'fs';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import downloadArtifact, { TASK_NAME } from '../../../../src/stages/deploy/tasks/downloadArtifact';
import getCwd from '../../../../src/utils/getCwd';
import NexusSearchResult from '../../../../src/types/NexusSearchResult';
import BuildError from '../../../../src/error/BuildError';
import stageName from '../../../../src/stages/deploy/stageName';

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    searchForMavenSnapshots: jest.fn(),
    searchForMavenReleases: jest.fn(),
    searchForNpmReleases: jest.fn(),
    searchForNpmBetas: jest.fn(),
    downloadArtifact: jest.fn()
}));

const getCwdMock = getCwd as jest.Mock;
const downloadArtifactApiMock = downloadArtifactApi as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;
const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;

const workingDirs = path.resolve(process.cwd(), 'test', '__working-dirs__');
const mavenReleaseWorkDir = path.resolve(workingDirs, 'mavenReleaseApplication');
const mavenReleaseBuildDir = path.resolve(mavenReleaseWorkDir, 'deploy', 'build');
const mavenPreReleaseWorkDir = path.resolve(workingDirs, 'mavenSnapshotApplication');
const mavenPreReleaseBuildDir = path.resolve(mavenPreReleaseWorkDir, 'deploy', 'build');
const npmReleaseWorkDir = path.resolve(workingDirs, 'npmReleaseApplication');
const npmPreReleaseWorkDir = path.resolve(workingDirs, 'npmBetaApplication');
const npmReleaseBuildDir = path.resolve(npmReleaseWorkDir, 'deploy', 'build');
const npmPreReleaseBuildDir = path.resolve(npmPreReleaseWorkDir, 'deploy', 'build');

const cleanDirs = () => {
    if (fs.existsSync(mavenReleaseBuildDir)) {
        fs.rmdirSync(mavenReleaseBuildDir, { recursive: true });
    }

    if (fs.existsSync(mavenPreReleaseBuildDir)) {
        fs.rmdirSync(mavenPreReleaseBuildDir, { recursive: true });
    }

    if (fs.existsSync(npmReleaseBuildDir)) {
        fs.rmdirSync(npmReleaseBuildDir, { recursive: true });
    }

    if (fs.existsSync(npmPreReleaseBuildDir)) {
        fs.rmdirSync(npmPreReleaseBuildDir, { recursive: true });
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

const emptySearchResult: NexusSearchResult = {
    items: []
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
        downloadArtifactApiMock.mockImplementation(() => TE.right(''));
        searchForMavenSnapshotsMock.mockImplementation(() => TE.right(searchResult));

        const result = await downloadArtifact(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        const targetPath = path.resolve(mavenPreReleaseBuildDir, 'my-project-1.0.0-SNAPSHOT.jar');

        expect(downloadArtifactApi).toHaveBeenCalledWith(downloadUrl, targetPath);
        expect(searchForMavenSnapshotsMock).toHaveBeenCalledWith('my-project', '1.0.0-SNAPSHOT');
        expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
        expect(searchForNpmBetasMock).not.toHaveBeenCalled();
        expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
    });

    it('cannot find maven release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.MavenApplication,
            name: 'my-project',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: []
        };

        getCwdMock.mockImplementation(() => mavenPreReleaseWorkDir);
        downloadArtifactApiMock.mockImplementation(() => TE.right(''));
        searchForMavenReleasesMock.mockImplementation(() => TE.right(emptySearchResult));

        const result = await downloadArtifact(projectInfo)();
        expect(result).toEqualLeft(new BuildError(
            'Unable to find artifact in Nexus. MavenApplication my-project 1.0.0',
            stageName,
            TASK_NAME
        ));

        expect(searchForMavenReleasesMock).toHaveBeenCalledWith('my-project', '1.0.0');
        expect(downloadArtifactApi).not.toHaveBeenCalled();
        expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
        expect(searchForNpmBetasMock).not.toHaveBeenCalled();
        expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
    });

    it('downloads maven release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.MavenApplication,
            name: 'my-project',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: []
        };

        getCwdMock.mockImplementation(() => mavenReleaseWorkDir);
        downloadArtifactApiMock.mockImplementation(() => TE.right(''));
        searchForMavenReleasesMock.mockImplementation(() => TE.right(searchResult));

        const result = await downloadArtifact(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        const targetPath = path.resolve(mavenReleaseBuildDir, 'my-project-1.0.0.jar');

        expect(downloadArtifactApi).toHaveBeenCalledWith(downloadUrl, targetPath);
        expect(searchForMavenReleasesMock).toHaveBeenCalledWith('my-project', '1.0.0');
        expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
        expect(searchForNpmBetasMock).not.toHaveBeenCalled();
        expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
    });

    it('downloads npm release', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmApplication,
            name: 'my-project',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: []
        };

        getCwdMock.mockImplementation(() => npmReleaseWorkDir);
        downloadArtifactApiMock.mockImplementation(() => TE.right(''));
        searchForNpmReleasesMock.mockImplementation(() => TE.right(searchResult));

        const result = await downloadArtifact(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        const targetPath = path.resolve(npmReleaseBuildDir, 'my-project-1.0.0.tgz');

        expect(downloadArtifactApi).toHaveBeenCalledWith(downloadUrl, targetPath);
        expect(searchForNpmReleasesMock).toHaveBeenCalledWith('my-project', '1.0.0');
        expect(searchForNpmBetasMock).not.toHaveBeenCalled();
        expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
        expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
    });

    it('downloads npm beta', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmApplication,
            name: 'my-project',
            version: '1.0.0-beta',
            isPreRelease: true,
            dependencies: []
        };

        getCwdMock.mockImplementation(() => npmPreReleaseWorkDir);
        downloadArtifactApiMock.mockImplementation(() => TE.right(''));
        searchForNpmBetasMock.mockImplementation(() => TE.right(searchResult));

        const result = await downloadArtifact(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        const targetPath = path.resolve(npmPreReleaseBuildDir, 'my-project-1.0.0-beta.tgz');

        expect(downloadArtifactApi).toHaveBeenCalledWith(downloadUrl, targetPath);
        expect(searchForNpmBetasMock).toHaveBeenCalledWith('my-project', '1.0.0-beta*');
        expect(searchForNpmReleasesMock).not.toHaveBeenCalled();
        expect(searchForMavenSnapshotsMock).not.toHaveBeenCalled();
        expect(searchForMavenReleasesMock).not.toHaveBeenCalled();
    });
});
