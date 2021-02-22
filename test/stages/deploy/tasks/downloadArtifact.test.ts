import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import { downloadArtifact as downloadArtifactService } from '../../../../src/common/services/NexusRepoApi';
import path from 'path';
import fs from 'fs';

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    downloadArtifact: jest.fn()
}));

const downloadArtifactServiceMock = downloadArtifactService as jest.Mock;
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

describe('downloadArtifact task', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        cleanDirs();
    });

    afterEach(() => {
        cleanDirs();
    });

    it('downloads maven pre-release', () => {
        throw new Error();
    });

    it('downloads maven release', () => {
        throw new Error();
    });
});
