import { regexTest } from './functions/RegExp';

export {};

const BETA_VERSION_REGEX = /^.*-beta/;

const doMatch = (fn: (s: string) => boolean) => {
	console.log(fn);
	return fn('1.0.0-beta');
}

// const result = doMatch(BETA_VERSION_REGEX.test);
// console.log(result);

const betaVersionTest = regexTest(BETA_VERSION_REGEX);
const result = doMatch(betaVersionTest);
console.log(result);
