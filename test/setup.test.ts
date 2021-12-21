import { setupBuildContext } from '../src/setup';
import { OptionValues } from 'commander';
import * as O from 'fp-ts/Option';

describe('setup', () => {
	it('setupBuildContext', () => {
		const options: OptionValues = {
			kubernetesOnly: true
		};
		const buildContext = setupBuildContext(options);
		expect(buildContext).toEqual({
			options,
			commandInfo: O.none
		});
	});
});
