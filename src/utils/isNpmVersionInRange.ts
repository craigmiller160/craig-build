import {string} from 'fp-ts';

const cleanVersionForPeerValidation = (version: string): string =>
	version.replace(/-beta/g, '').replace(/^[\^~]/, '');

export const isNpmVersionInRange = (
	version: string,
	range: string
): boolean => {


	// TODO finish this
	return false;
};
