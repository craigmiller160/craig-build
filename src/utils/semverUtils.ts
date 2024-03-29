import semver from 'semver';

export type VersionRegexGroups = Readonly<{
	range?: string;
	major: string;
	minor: string;
	patch: string;
	beta?: string;
	betaNumber?: string;
}>;

export const VERSION_REGEX =
	/^(?<range>[\^~])?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?<beta>-beta(\.(?<betaNumber>\d+))?)?$/;

export const semverTrimVersion = (version: string): string =>
	version.split('-')[0];

export const semverMaxVersion = (version: string): string => {
	const groups = VERSION_REGEX.exec(version)?.groups as
		| VersionRegexGroups
		| undefined;

	if (groups?.beta) {
		return `${groups.major}.${groups.minor}.${groups.patch}-beta.999`;
	}

	if (groups?.range === '~' || groups?.major === '0') {
		return `${groups.major}.${groups.minor}.999`;
	}

	if (groups?.range === '^') {
		return `${groups.major}.999.999`;
	}

	return version;
};

export const semverSatisifies = (
	versionExpression: string,
	semverRange: string
): boolean => {
	const minVersion = semver.minVersion(versionExpression)?.version ?? '0.0.0';
	const maxVersion = semverMaxVersion(versionExpression);
	return (
		semver.satisfies(minVersion, semverRange) &&
		semver.satisfies(maxVersion, semverRange)
	);
};
