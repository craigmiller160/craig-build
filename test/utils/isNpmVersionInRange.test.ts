import { isNpmVersionInRange } from '../../src/utils/isNpmVersionInRange';

describe('isNpmVersionInRange', () => {
	describe('absolute versions', () => {
		it('greater than', () => {
			expect(isNpmVersionInRange('2.0.0', '1.0.0')).toEqual(false);
			expect(isNpmVersionInRange('1.0.1', '1.0.0')).toEqual(false);
			expect(isNpmVersionInRange('1.1.0', '1.0.0')).toEqual(false);
		});

		it('less than', () => {
			expect(isNpmVersionInRange('1.0.0', '2.0.0')).toEqual(false);
			expect(isNpmVersionInRange('1.0.0', '1.1.0')).toEqual(false);
			expect(isNpmVersionInRange('1.0.0', '1.0.1')).toEqual(false);
		});

		it('equal to', () => {
			throw new Error();
		});
	});

	describe('X.x versions', () => {
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
