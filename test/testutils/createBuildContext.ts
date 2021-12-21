import { OptionValues } from 'commander';
import { BuildContext } from '../../src/context/BuildContext';
import { CommandInfo } from '../../src/context/CommandInfo';
import { CommandType } from '../../src/context/CommandType';
import * as O from 'fp-ts/Option';

const defaultOptions: OptionValues = {
	fullBuild: true
};
const defaultCommandInfo: CommandInfo = {
	type: CommandType.FULL_BUILD
};

export const createBuildContext = ({
	options = defaultOptions,
	commandInfo = O.some(defaultCommandInfo)
}: BuildContext): BuildContext => ({
	options,
	commandInfo
});
