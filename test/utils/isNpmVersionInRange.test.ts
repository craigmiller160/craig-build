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

		expect(isNpmVersionInRange('1.0.0-beta', '1.0.0-beta')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta.1', '1.0.0-beta.1')).toEqual(
			true
		);
		expect(isNpmVersionInRange('1.0.0-beta', '1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('1.0.0-beta.1', '1.0.0-beta.1')).toEqual(
			false
		);
	});

	it('X.x versions', () => {
		expect(isNpmVersionInRange('1.0.0', '1.x')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0', '1.0.x')).toEqual(true);

		expect(isNpmVersionInRange('2.0.0', '1.x')).toEqual(false);
		expect(isNpmVersionInRange('1.1.0', '1.0.x')).toEqual(false);

		expect(isNpmVersionInRange('1.0.0-beta', '1.x')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta', '1.0.x')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta.1', '1.x')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta.1', '1.0.x')).toEqual(true);
	});

	it('^/~ versions', () => {
		expect(isNpmVersionInRange('1.0.0', '^1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.0.1', '^1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.1.0', '^1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('2.0.0', '^1.0.0')).toEqual(false);

		expect(isNpmVersionInRange('1.0.0-beta', '^1.0.0-beta')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta', '^1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('1.0.0-beta.1', '^1.0.0-beta.1')).toEqual(
			true
		);
		expect(isNpmVersionInRange('1.0.0-beta.1', '^1.0.0-beta.2')).toEqual(
			false
		);

		expect(isNpmVersionInRange('1.0.0', '~1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.0.1', '~1.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.1.0', '~1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('2.0.0', '~1.0.0')).toEqual(false);

		expect(isNpmVersionInRange('1.0.0-beta', '~1.0.0-beta')).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta', '~1.0.0')).toEqual(false);
		expect(isNpmVersionInRange('1.0.0-beta.1', '~1.0.0-beta.1')).toEqual(
			true
		);
		expect(isNpmVersionInRange('1.0.0-beta.1', '~1.0.0-beta.2')).toEqual(
			false
		);
	});

	it('range versions', () => {
		expect(isNpmVersionInRange('1.0.0', '>= 1.0.0 < 2.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.0.1', '>= 1.0.0 < 2.0.0')).toEqual(true);
		expect(isNpmVersionInRange('1.1.0', '>= 1.0.0 < 2.0.0')).toEqual(true);
		expect(isNpmVersionInRange('2.0.0', '>= 1.0.0 < 2.0.0')).toEqual(false);

		expect(
			isNpmVersionInRange('1.0.0-beta', '>= 1.0.0-beta < 2.0.0')
		).toEqual(true);
		expect(isNpmVersionInRange('1.0.0-beta', '>= 1.0.0 < 2.0.0')).toEqual(
			false
		);
		expect(
			isNpmVersionInRange('1.0.0-beta.1', '>= 1.0.0-beta.1 < 2.0.0')
		).toEqual(true);
		expect(
			isNpmVersionInRange('1.0.0-beta.1', '>= 1.0.0-beta.2 < 2.0.0')
		).toEqual(false);
	});
});
