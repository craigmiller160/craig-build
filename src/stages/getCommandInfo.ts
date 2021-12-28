import { SetupStage, StageExecuteFn } from './Stage';
import { match } from 'ts-pattern';
import { OptionValues } from 'commander';
import { CommandInfo } from '../context/CommandInfo';
import { CommandType } from '../context/CommandType';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { program } from 'commander';
import { IncompleteBuildContext } from '../context/IncompleteBuildContext';

const constructCommandInfo = (options: OptionValues): CommandInfo =>
	match<OptionValues, CommandInfo>(options)
		.with({ fullBuild: true }, () => ({ type: CommandType.FullBuild }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DockerOnly }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KubernetesOnly
		}))
		.run();

const execute: StageExecuteFn<IncompleteBuildContext> = (context) =>
	TE.right({
		...context,
		commandInfo: O.some(constructCommandInfo(program.opts()))
	});

export const getCommandInfo: SetupStage = {
	name: 'Get Command Info',
	execute
};
