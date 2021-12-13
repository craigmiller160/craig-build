export {};

describe('bumpDockerPreReleaseVersion', () => {
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