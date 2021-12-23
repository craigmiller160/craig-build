import { Stage, StageFunction } from './Stage';
import { match } from 'ts-pattern';
import { OptionValues } from 'commander';
import { CommandInfo } from '../context/CommandInfo';
import { CommandType } from '../context/CommandType';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { program } from 'commander';

const constructCommandInfo = (options: OptionValues): CommandInfo =>
	match<OptionValues, CommandInfo>(options)
		.with({ fullBuild: true }, () => ({ type: CommandType.FULL_BUILD }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DOCKER_ONLY }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KUBERNETES_ONLY
		}))
		.run();

const execute: StageFunction = (context) =>
	TE.right({
		...context,
		commandInfo: O.some(constructCommandInfo(program.opts()))
	});

export const getCommandInfo: Stage = {
	name: 'Get Command Info',
	execute
};
