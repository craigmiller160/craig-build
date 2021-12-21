import { OptionValues } from 'commander';
import { CommandType } from '../../src/context/CommandType';
import { BuildContext } from '../../src/context/BuildContext';
import * as O from 'fp-ts/Option';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import '@relmify/jest-fp-ts';

describe('getCommandInfo', () => {
	it('FULL_BUILD', async () => {
		const options: OptionValues = {
			fullBuild: true
		};
		const buildContext: BuildContext = {
			options,
			commandInfo: O.none
		};
		const result = await getCommandInfo(buildContext)();
		expect(result).toEqualRight({
			options,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			})
		});
	});

	it('DOCKER_ONLY', async () => {
		const options: OptionValues = {
			dockerOnly: true
		};
		const buildContext: BuildContext = {
			options,
			commandInfo: O.none
		};
		const result = await getCommandInfo(buildContext)();
		expect(result).toEqualRight({
			options,
			commandInfo: O.some({
				type: CommandType.DOCKER_ONLY
			})
		});
	});

	it('KUBERNETES_ONLY', async () => {
		const options: OptionValues = {
			kubernetesOnly: true
		};
		const buildContext: BuildContext = {
			options,
			commandInfo: O.none
		};
		const result = await getCommandInfo(buildContext)();
		expect(result).toEqualRight({
			options,
			commandInfo: O.some({
				type: CommandType.KUBERNETES_ONLY
			})
		});
	});
});
