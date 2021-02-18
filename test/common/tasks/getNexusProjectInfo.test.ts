import {
    searchForMavenReleases,
    searchForMavenSnapshots,
    searchForNpmBetas,
    searchForNpmReleases
} from '../../../src/common/services/NexusRepoApi';
import ProjectType from '../../../src/types/ProjectType';
import ProjectInfo from '../../../src/types/ProjectInfo';
import getNexusProjectInfo from '../../../src/common/tasks/getNexusProjectInfo';
import NexusSearchResult from '../../../src/types/NexusSearchResult';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import Mock = jest.Mock;

jest.mock('../../../src/common/services/NexusRepoApi', () => ({
    searchForNpmBetas: jest.fn(),
    searchForNpmReleases: jest.fn(),
    searchForMavenReleases: jest.fn(),
    searchForMavenSnapshots: jest.fn()
}));

const searchForNpmBetasMock = searchForNpmBetas as Mock;
const searchForNpmReleasesMock = searchForNpmReleases as Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as Mock;
const searchForMavenReleasesMock = searchForMavenReleases as Mock;

const createProjectInfo = (projectType: ProjectType): ProjectInfo => ({
    projectType,
    name: 'The Project',
    version: '1.1.0',
    isPreRelease: false,
    dependencies: []
});

const createNexusResult = (version: string): NexusSearchResult => ({
    items: [
        {
            id: '',
            repository: '',
            format: '',
            group: '',
            name: '',
            version,
            assets: []
        }
    ]
});

const nexusEmptyResult: NexusSearchResult = {
    items: []
};

const mockMavenVersionExists = () => {
    searchForMavenReleasesMock.mockImplementation(() => TE.right(createNexusResult('Maven-Release')));
    searchForMavenSnapshotsMock.mockImplementation(() => TE.right(createNexusResult('Maven-Pre-Release')));
};

const mockMavenVersionNotExists = () => {
    searchForMavenReleasesMock.mockImplementation(() => TE.right(nexusEmptyResult));
    searchForMavenSnapshotsMock.mockImplementation(() => TE.right(nexusEmptyResult));
};

const mockNpmVersionExists = () => {
    searchForNpmReleasesMock.mockImplementation(() => TE.right(createNexusResult('Npm-Release')));
    searchForNpmBetasMock.mockImplementation(() => TE.right(createNexusResult('Npm-Pre-Release')));
};

const mockNpmVersionNotExists = () => {
    searchForNpmReleasesMock.mockImplementation(() => TE.right(nexusEmptyResult));
    searchForNpmBetasMock.mockImplementation(() => TE.right(nexusEmptyResult));
};

describe('getNexusProjectInfo task', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('get Maven Nexus Project Info', async () => {
        mockMavenVersionExists();
        const projectInfo = createProjectInfo(ProjectType.MavenApplication);
        const result = await getNexusProjectInfo(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: 'Maven-Pre-Release',
                latestReleaseVersion: 'Maven-Release'
            }
        });
    });

    it('get NPM Nexus Project Info', async () => {
        mockNpmVersionExists();
        const projectInfo = createProjectInfo(ProjectType.NpmApplication);
        const result = await getNexusProjectInfo(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: 'Npm-Pre-Release',
                latestReleaseVersion: 'Npm-Release'
            }
        });
    });

    it('NPM project does not exist in Nexus', async () => {
        mockNpmVersionNotExists();
        const projectInfo = createProjectInfo(ProjectType.NpmApplication);
        const result = await getNexusProjectInfo(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: undefined,
                latestReleaseVersion: undefined
            }
        });
    });

    it('Maven project does not exist in Nexus', async () => {
        mockMavenVersionNotExists();
        const projectInfo = createProjectInfo(ProjectType.MavenApplication);
        const result = await getNexusProjectInfo(projectInfo)();
        expect(result).toEqualRight({
            ...projectInfo,
            latestNexusVersions: {
                latestPreReleaseVersion: undefined,
                latestReleaseVersion: undefined
            }
        });
    });
});
