import { searchForNpmBetas, searchForMavenSnapshots } from '../../../../src/common/services/NexusRepoApi';

jest.mock('../../../../src/common/services/NexusRepoApi', () => ({
    searchForNpmBetas: jest.fn(),
    searchForMavenSnapshots: jest.fn()
}));

const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForMavenSnapshotsMock = searchForMavenSnapshots as jest.Mock;

describe('bumpDockerPreReleaseVersion', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('bumps docker pre-release version for NPM', () => {
        throw new Error();
    });

    it('cannot find existing pre-release version for NPM', () => {
        throw new Error();
    });

    it('bumps docker pre-release version for Maven', () => {
        throw new Error();
    });

    it('cannot find existing pre-release version for Maven', () => {
        throw new Error();
    });

    it('bumps docker pre-release version for Docker', () => {
        throw new Error();
    });

    describe('skip execution', () => {
        it('is not docker, application, or pre-release', () => {
            throw new Error();
        });

        it('is pre-release docker', () => {
            throw new Error();
        });

        it('is release docker', () => {
            throw new Error();
        });

        it('is pre-release non-docker application', () => {
            throw new Error();
        });

        it('is release non-docker application', () => {
            throw new Error();
        });
    });
});