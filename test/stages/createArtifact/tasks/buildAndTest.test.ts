import runCommand from '../../../../src/utils/runCommand';

const runCommandMock = runCommand as jest.Mock;

describe('buildAndTest task', () => {
    it('runs NPM build', () => {
        throw new Error();
    });

    it('runs Maven build', () => {
        throw new Error();
    });

    it('unknown project type', () => {
        throw new Error();
    });
});