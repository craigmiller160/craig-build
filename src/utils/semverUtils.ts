import semver from 'semver';

export type VersionRegexGroups = Readonly<{
	major: string;
	minor: string;
	patch: string;
	beta?: string;
}>;

export const VERSION_REGEX =
	/(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d)(-beta(\.(?<beta>\d+)?))?/;

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

export const semverSatisifies = (
	versionExpression: string,
	semverRange: string
): boolean => {
	return false;
};
