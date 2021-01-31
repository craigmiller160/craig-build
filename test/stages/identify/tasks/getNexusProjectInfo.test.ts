import {
    searchForNpmBetas,
    searchForNpmReleases,
    searchForMavenReleases,
    searchForMavenSnapshots
} from '../../../../src/common/services/NexusRepoApi';
import Mock = jest.Mock;

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    searchForNpmBetas: jest.fn(),
    searchForNpmReleases: jest.fn(),
    searchForMavenReleases: jest.fn(),
    searchForMavenSnapshots: jest.fn()
}));

const searchForNpmBetasMock = searchForNpmBetas as Mock;
const searchForNpmReleasesMock = searchForNpmReleases as Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as Mock;
const searchForMavenReleasesMock = searchForMavenReleases as Mock;

describe('getNexusProjectInfo task', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('get Maven Nexus Project Info', () => {
        throw new Error();
    });

    it('get NPM Nexus Project Info', () => {
        throw new Error();
    });
});