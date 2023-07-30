import {
	semverMaxVersion,
	semverSatisifies,
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
		expect(semverSatisifies('^1.0.0', '^1.0.0')).toEqual(true);
		expect(semverSatisifies('^1.0.0', '>= 1.0.0')).toEqual(true);
		expect(semverSatisifies('^2.0.0', '^1.0.0')).toEqual(false);
		expect(semverSatisifies('^1.0.0-beta', '^1.0.0-beta')).toEqual(true);
		expect(semverSatisifies('^1.0.0-beta.1', '^1.0.0-beta')).toEqual(true);
		expect(semverSatisifies('^1.0.0', '^1.0.0-beta')).toEqual(false);
	});
});
