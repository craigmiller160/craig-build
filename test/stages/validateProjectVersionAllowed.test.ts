import {
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';
import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForDockerReleases: jest.fn(),
	searchForMavenReleases: jest.fn(),
	searchForNpmReleases: jest.fn()
}));

const searchForDockerReleasesMock = searchForDockerReleases as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;

const buildContext = createBuildContext();

describe('validateProjectVersionAllowed', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('allows npm pre-release version', () => {
		throw new Error();
	});

	it('allows maven pre-release version', () => {
		throw new Error();
	});

	it('allows docker pre-release version', () => {
		throw new Error();
	});

	it('allows npm release version with no conflicts', () => {
		throw new Error();
	});

	it('allows maven release version with no conflicts', () => {
		throw new Error();
	});

	it('allows docker release version with no conflicts', () => {
		throw new Error();
	});

	it('rejects npm release version with conflict', () => {
		throw new Error();
	});

	it('rejects maven release version with conflicts', () => {
		throw new Error();
	});

	it('rejects docker release version with conflicts', () => {
		throw new Error();
	});
});
