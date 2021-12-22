import { createBuildContext } from '../testutils/createBuildContext';
import * as O from 'fp-ts/Option';
import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';

describe('validateBuildToolVersion', () => {
	it('tool version is highest release version', async () => {
		const buildContext = createBuildContext({
			buildToolInfo: O.some({
				group: 'craigmiller160',
				name: 'craig-build',
				version: '1.0.0',
				isPreRelease: false
			})
		});

		const result = await validateBuildToolVersion.execute(buildContext)();
		expect(result).toEqual(buildContext);
	});

	it('tool version is not highest release version', async () => {
		throw new Error();
	});

	it('user allows tool with pre-release version to run', async () => {
		throw new Error();
	});

	it('user does not allow tool with pre-release version to run', async () => {
		throw new Error();
	});
});
