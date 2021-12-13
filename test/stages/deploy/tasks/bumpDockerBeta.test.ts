export {};

describe('bumpDockerBeta', () => {
    it('bumps docker beta for NPM', () => {
        throw new Error();
    });

    it('bumps docker beta for Maven', () => {
        throw new Error();
    });

    it('bumps docker beta for Docker', () => {
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