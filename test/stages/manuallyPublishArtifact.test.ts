import { runCommandMock } from '../testutils/runCommandMock';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';

const baseBuildContext = createBuildContext();

describe('manuallyPublishArtifact', () => {
	it('skips for Maven project', () => {
		throw new Error();
	});

	it('skips for Docker project', () => {
		throw new Error();
	});

	it('publishes NPM project', () => {
		throw new Error();
	});
});
