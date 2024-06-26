import { describe, it, expect } from 'vitest';
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
		const nonBetaGroups = nonBetaResult!
			.groups as unknown as VersionRegexGroups;
		expect(nonBetaGroups).toEqual({
			range: undefined,
			major: '1',
			minor: '2',
			patch: '3',
			beta: undefined,
			betaNumber: undefined
		});

		const betaResult = VERSION_REGEX.exec('1.2.3-beta');
		expect(betaResult).not.toBeNull();
		const betaGroups = betaResult!.groups as unknown as VersionRegexGroups;
		expect(betaGroups).toEqual({
			range: undefined,
			major: '1',
			minor: '2',
			patch: '3',
			beta: '-beta',
			betaNumber: undefined
		});

		const betaResultWithNumber = VERSION_REGEX.exec('1.2.3-beta.4');
		expect(betaResultWithNumber).not.toBeNull();
		const betaGroupsWithNumber = betaResultWithNumber!
			.groups as unknown as VersionRegexGroups;
		expect(betaGroupsWithNumber).toEqual({
			range: undefined,
			major: '1',
			minor: '2',
			patch: '3',
			beta: '-beta.4',
			betaNumber: '4'
		});

		const nonBetaRangeResult1 = VERSION_REGEX.exec('^1.2.3');
		expect(nonBetaRangeResult1).not.toBeNull();
		const nonBetaRangeGroups1 = nonBetaRangeResult1!
			.groups as unknown as VersionRegexGroups;
		expect(nonBetaRangeGroups1).toEqual({
			range: '^',
			major: '1',
			minor: '2',
			patch: '3',
			beta: undefined,
			betaNumber: undefined
		});

		const nonBetaRangeResult2 = VERSION_REGEX.exec('~1.2.3');
		expect(nonBetaRangeResult2).not.toBeNull();
		const nonBetaRangeGroups2 = nonBetaRangeResult2!
			.groups as unknown as VersionRegexGroups;
		expect(nonBetaRangeGroups2).toEqual({
			range: '~',
			major: '1',
			minor: '2',
			patch: '3',
			betaNumber: undefined
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
		expect(semverMaxVersion('^2.2.20')).toEqual('2.999.999');
		expect(semverMaxVersion('^0.34.3')).toEqual('0.34.999');
	});

	it('semverSatisfies', () => {
		expect(semverSatisifies('^1.0.0', '^1.0.0')).toEqual(true);
		expect(semverSatisifies('^1.0.0', '>= 1.0.0')).toEqual(true);
		expect(semverSatisifies('^2.0.0', '^1.0.0')).toEqual(false);
		expect(semverSatisifies('^1.0.0-beta', '^1.0.0-beta')).toEqual(true);
		expect(semverSatisifies('^1.0.0-beta.1', '^1.0.0-beta')).toEqual(true);
		expect(semverSatisifies('^1.0.0-beta', '^1.0.0')).toEqual(false);
		expect(semverSatisifies('^1.0.0', '^1.0.0-beta')).toEqual(true);
		expect(semverSatisifies('^0.34.3', '^0.34.3')).toEqual(true);
	});
});
