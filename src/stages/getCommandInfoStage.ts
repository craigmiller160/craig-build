import { Stage } from './Stage';
import { match } from 'ts-pattern';
import { OptionValues } from 'commander';
import { CommandInfo } from '../context/CommandInfo';
import { CommandType } from '../context/CommandType';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';

const constructCommandInfo = (options: OptionValues): CommandInfo =>
	match<OptionValues, CommandInfo>(options)
		.with({ fullBuild: true }, () => ({ type: CommandType.FULL_BUILD }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DOCKER_ONLY }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KUBERNETES_ONLY
		}))
		.run();

export const getCommandInfo: Stage = (context) =>
	TE.right({
		...context,
		commandInfo: O.some(constructCommandInfo(context.options))
	});
