import { CommandType } from '../../src/context/CommandType';
import {
	isDockerOnly,
	isFullBuild,
	isKubernetesOnly
} from '../../src/context/commandTypeUtils';

export {};

const verifyFullBuild = (results: boolean[], value: boolean) => {
	expect(results[0]).toEqual(value);
};
const verifyDockerOnly = (results: boolean[], value: boolean) => {
	expect(results[1]).toEqual(value);
};
const verifyKubernetesOnly = (results: boolean[], value: boolean) => {
	expect(results[2]).toEqual(value);
};
const verifyUnknownType = (results: boolean[], value: boolean) => {
	expect(results[3]).toEqual(value);
};

const commandTypes = Object.values(CommandType);

describe('commandTypeUtils', () => {
	it('isFullBuild', () => {
		const results = commandTypes.map(isFullBuild);
		verifyFullBuild(results, true);
		verifyDockerOnly(results, false);
		verifyKubernetesOnly(results, false);
		verifyUnknownType(results, false);
	});

	it('isDockerOnly', () => {
		const results = commandTypes.map(isDockerOnly);
		verifyFullBuild(results, false);
		verifyDockerOnly(results, true);
		verifyKubernetesOnly(results, false);
		verifyUnknownType(results, false);
	});

	it('isKubernetesOnly', () => {
		const results = commandTypes.map(isKubernetesOnly);
		verifyFullBuild(results, false);
		verifyDockerOnly(results, false);
		verifyKubernetesOnly(results, true);
		verifyUnknownType(results, false);
	});
});
