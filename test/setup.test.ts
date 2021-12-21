import { setupBuildContext } from '../src/setup';
import { OptionValues } from 'commander';
import { CommandType } from '../src/context/CommandType';

describe('setup', () => {
	describe('setupBuildContext', () => {
		it('setup for FULL_BUILD', () => {
			const options: OptionValues = {
				fullBuild: true
			};
			const buildContext = setupBuildContext(options);
			expect(buildContext).toEqual({
				commandInfo: {
					type: CommandType.FULL_BUILD
				}
			});
		});

		it('setup for DOCKER_ONLY', () => {
			const options: OptionValues = {
				dockerOnly: true
			};
			const buildContext = setupBuildContext(options);
			expect(buildContext).toEqual({
				commandInfo: {
					type: CommandType.DOCKER_ONLY
				}
			});
		});

		it('setup for KUBERNETES_ONLY', () => {
			const options: OptionValues = {
				kubernetesOnly: true
			};
			const buildContext = setupBuildContext(options);
			expect(buildContext).toEqual({
				commandInfo: {
					type: CommandType.KUBERNETES_ONLY
				}
			});
		});
	});
});
