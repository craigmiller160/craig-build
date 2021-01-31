import handleUnknownError from '../../src/utils/handleUnknownError';

describe('handleUnknownError', () => {
    it('is error', () => {
        throw new Error();
    });

    it('is unknown', () => {
        throw new Error();
    });
})
