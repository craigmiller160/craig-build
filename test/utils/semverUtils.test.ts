import {
	semverMaxVersion,
	semverTrimVersion
} from '../../src/utils/semverUtils';

describe('semverUtils', () => {
	it('semverTrimVersion', () => {
		expect(semverTrimVersion('1.0.0')).toEqual('1.0.0');
		expect(semverTrimVersion('1.0.0-beta')).toEqual('1.0.0');
	});

	it('semverMaxVersion', () => {
		expect(semverMaxVersion('1.0.0')).toEqual('1.0.0');
		expect(semverMaxVersion('~1.0.0')).toEqual('1.0.999');
		expect(semverMaxVersion('^1.0.0')).toEqual('1.999.999');
	});

	it('semverSatisfies', () => {
		throw new Error();
	});
});
