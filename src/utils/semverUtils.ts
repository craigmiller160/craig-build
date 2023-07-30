import semver from 'semver';

export const semverTrimVersion = (version: string): string =>
	version.split('-')[0];

export const semverMaxVersion = (version: string): string => {
	if (version.charAt(0) === '~') {
		const parts = version.slice(1).split('.');
		return `${parts[0]}.${parts[1]}.999`;
	}

	if (version.charAt(0) == '^') {
		const parts = version.slice(1).split('.');
		return `${parts[0]}.999.999`;
	}

	return version;
};

export const semverSatisifies = (versionExpression: string, semverRange: string): boolean => {
	return false;
};
