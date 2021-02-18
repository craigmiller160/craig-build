import '@relmify/jest-fp-ts';
import { sync } from 'cross-spawn';

jest.mock('cross-spawn', () => ({
    sync: jest.fn()
}));

const runCommand = jest.requireActual('../../src/utils/runCommand').default;

const syncMock = sync as jest.Mock;

const command = 'cross-env NODE_ENV=dev node script.js';
const successResult = {
    status: 0,
    stdout: 'Success'
};

const failedResult = {
    status: 1,
    stderr: 'Failed'
};

const noStatusResult = {
    status: null
};

describe('runCommand', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('test successful command', () => {
        syncMock.mockImplementation(() => successResult);
        const result = runCommand(command);
        expect(result).toEqualRight('Success');
    });

    it('test failed command', () => {
        syncMock.mockImplementation(() => failedResult);
        const result = runCommand(command);
        expect(result).toEqualLeft(new Error('Failed'));
    });

    it('test no status command', () => {
        syncMock.mockImplementation(() => noStatusResult);
        const result = runCommand(command);
        expect(result).toEqualLeft(new Error('No status code returned from command'));
    });
});
