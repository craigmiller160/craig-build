import {
	semverMaxVersion,
	semverSatisifies,
	semverTrimVersion,
	VERSION_REGEX,
	VersionRegexGroups
} from '../../src/utils/semverUtils';

describe('semverUtils', () => {
	it('VERSION_REGEX', () => {
		expect(VERSION_REGEX.exec('foo')).toBeNull();

		const nonBetaResult = VERSION_REGEX.exec('1.2.3');
		expect(nonBetaResult).not.toBeNull();
		const nonBetaGroups = nonBetaResult!.groups as unknown as VersionRegexGroups;
		expect(nonBetaGroups).toEqual({
			major: '1',
			minor: '2',
			patch: '3',
			beta: undefined
		});

		const betaResult = VERSION_REGEX.exec('1.2.3-beta.4');
		expect(betaResult).not.toBeNull();
		const betaGroups = betaResult!.groups as unknown as VersionRegexGroups;
		expect(betaGroups).toEqual({
			major: '1',
			minor: '2',
			patch: '3',
			beta: '4'
		});
	});

	it('semverTrimVersion', () => {
		expect(semverTrimVersion('1.0.0')).toEqual('1.0.0');
		expect(semverTrimVersion('1.0.0-beta')).toEqual('1.0.0');
	});

	it('semverMaxVersion', () => {
		expect(semverMaxVersion('1.0.0')).toEqual('1.0.0');
		expect(semverMaxVersion('~1.0.0')).toEqual('1.0.999');
		expect(semverMaxVersion('^1.0.0')).toEqual('1.999.999');
		expect(semverMaxVersion('1.0.0-beta')).toEqual('1.0.0-beta.999');
		expect(semverMaxVersion('1.0.0-beta.1')).toEqual('1.0.0-beta.999');
		expect(semverMaxVersion('~1.0.0-beta.1')).toEqual('1.0.0-beta.999');
		expect(semverMaxVersion('^1.0.0-beta.1')).toEqual('1.0.0-beta.999');
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
