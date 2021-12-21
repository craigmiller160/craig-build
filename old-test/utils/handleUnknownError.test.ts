import handleUnknownError from '../../old-src/utils/handleUnknownError';

describe('handleUnknownError', () => {
	it('is error', () => {
		const error = new Error();
		const result = handleUnknownError(error);
		expect(result).toEqual(error);
	});

	it('is unknown', () => {
		const foo = 'foo';
		const result = handleUnknownError(foo);
		expect(result).toEqual(new Error(`Unknown Error: ${foo}`));
	});
});
