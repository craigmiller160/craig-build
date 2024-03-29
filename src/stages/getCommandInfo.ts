import { Stage, StageExecuteFn } from './Stage';
import { match } from 'ts-pattern';
import { OptionValues, program } from 'commander';
import { CommandInfo } from '../context/CommandInfo';
import { CommandType } from '../context/CommandType';
import { taskEither, predicate } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';

const constructCommandInfo = (options: OptionValues): CommandInfo =>
	match<OptionValues, CommandInfo>(options)
		.with({ fullBuild: true }, () => ({ type: CommandType.FullBuild }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DockerOnly }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KubernetesOnly
		}))
		.with({ terraformOnly: true }, () => ({
			type: CommandType.TerraformOnly
		}))
		.run();

const execute: StageExecuteFn = (context) =>
	taskEither.right({
		...context,
		commandInfo: constructCommandInfo(program.opts())
	});
const shouldStageExecute: predicate.Predicate<BuildContext> = () => true;

export const getCommandInfo: Stage = {
	name: 'Get Command Info',
	execute,
	shouldStageExecute
};
