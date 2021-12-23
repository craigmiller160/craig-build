import { setupBuildContext } from '../src/setup';
import { OptionValues } from 'commander';
import * as O from 'fp-ts/Option';

describe('setup', () => {
	it('setupBuildContext', () => {
		const buildContext = setupBuildContext();
		expect(buildContext).toEqual({
			commandInfo: O.none,
			buildToolInfo: O.none,
			projectType: O.none,
			projectInfo: O.none
		});
	});
});
