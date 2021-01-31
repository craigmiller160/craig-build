import Mock = jest.Mock;
import getCwd from '../src/utils/getCwd';

jest.mock('../src/utils/getCwd', () => {
    return jest.fn();
});

beforeEach(() => {
    jest.clearAllMocks();
    (getCwd as Mock).mockReset();
});