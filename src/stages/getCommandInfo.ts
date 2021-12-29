import { Stage, StageExecuteFn } from './Stage';
import { match } from 'ts-pattern';
import { OptionValues } from 'commander';
import { CommandInfo } from '../context/CommandInfo';
import { CommandType } from '../context/CommandType';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';
import { program } from 'commander';
import { BuildContext } from '../context/BuildContext';

const constructCommandInfo = (options: OptionValues): CommandInfo =>
	match<OptionValues, CommandInfo>(options)
		.with({ fullBuild: true }, () => ({ type: CommandType.FullBuild }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DockerOnly }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KubernetesOnly
		}))
		.run();

const execute: StageExecuteFn = (context) =>
	TE.right({
		...context,
		commandInfo: constructCommandInfo(program.opts())
	});
const shouldStageExecute: P.Predicate<BuildContext> = () => true;

export const getCommandInfo: Stage = {
	name: 'Get Command Info',
	execute,
	shouldStageExecute
};
