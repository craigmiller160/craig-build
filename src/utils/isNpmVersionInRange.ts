import semver from 'semver';

// const cleanVersionForPeerValidation = (version: string): string =>
// 	version.replace(/-beta/g, '').replace(/^[\^~]/, '');

export const isNpmVersionInRange = (version: string, range: string): boolean =>
	semver.satisfies(version, range);
