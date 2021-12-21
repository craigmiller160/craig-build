import { OptionValues } from 'commander';
import { BuildContext } from './context/BuildContext';
import { CommandInfo } from './context/CommandInfo';
import { match } from 'ts-pattern';
import { CommandType } from './context/CommandType';

const constructCommandInfo = (options: OptionValues): CommandInfo =>
	match<OptionValues, CommandInfo>(options)
		.with({ fullBuild: true }, () => ({ type: CommandType.FULL_BUILD }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DOCKER_ONLY }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KUBERNETES_ONLY
		}))
		.run();

export const setupBuildContext = (options: OptionValues): BuildContext => ({
	commandInfo: constructCommandInfo(options)
});
