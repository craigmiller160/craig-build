import '@relmify/jest-fp-ts';
import Mock = jest.Mock;
import getCwd from '../src/utils/getCwd';
import runCommand from '../src/utils/runCommand';

jest.mock('../src/utils/getCwd', () => {
    return jest.fn();
});

jest.mock('../src/utils/runCommand', () => {
    return jest.fn();
});

beforeEach(() => {
    jest.clearAllMocks();
    (getCwd as Mock).mockReset();
    (runCommand as Mock).mockReset();
});
