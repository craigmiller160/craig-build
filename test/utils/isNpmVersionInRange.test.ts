import { isNpmVersionInRange } from '../../src/utils/isNpmVersionInRange';

describe('isNpmVersionInRange', () => {
	it('absolute versions', () => {
		expect(isNpmVersionInRange('2.0.0', '1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('1.0.1', '1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('1.1.0', '1.0.0')).toEqual(false);

		expect(isNpmVersionInRange('1.0.0', '2.0.0')).toEqual(false);
		expect(isNpmVersionInRange('1.0.0', '1.1.0')).toEqual(false);
		expect(isNpmVersionInRange('1.0.0', '1.0.1')).toEqual(false);

		expect(isNpmVersionInRange('1.0.0', '1.0.0')).toEqual(true);
	});

	it('X.x versions', () => {
		expect(isNpmVersionInRange('1.0.0', '1.x')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0', '1.0.x')).toEqual(true);

		expect(isNpmVersionInRange('2.0.0', '1.x')).toEqual(false);
		expect(isNpmVersionInRange('1.1.0', '1.0.x')).toEqual(false);
	});

	it('^/~ versions', () => {
		expect(isNpmVersionInRange('1.0.0', '^1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.0.1', '^1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.1.0', '^1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('2.0.0', '^1.0.0')).toEqual(false);

		expect(isNpmVersionInRange('1.0.0', '~1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.0.1', '~1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.1.0', '~1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('2.0.0', '~1.0.0')).toEqual(false);
	});

	describe('^/~ versions', () => {
		it('greater than', () => {
			throw new Error();
		});

		it('less than', () => {
			throw new Error();
		});

		it('equal to', () => {
			throw new Error();
		});
	});

	describe('range versions', () => {
		it('greater than', () => {
			throw new Error();
		});

		it('less than', () => {
			throw new Error();
		});

		it('equal to', () => {
			throw new Error();
		});
	});
});
