import { getRawProjectData } from '../../src/projectCache';

describe('caching raw project data', () => {
	beforeEach(() => {
		process.env.NODE_ENV = '';
	});

	afterEach(() => {
		process.env.NODE_ENV = 'test';
	});

	it('loads the data once, uses cache after that', async () => {
		throw new Error();
	});
});
