import { OptionValues } from 'commander';
import { BuildContext } from '../../src/context/BuildContext';
import { CommandInfo } from '../../src/context/CommandInfo';
import { CommandType } from '../../src/context/CommandType';
import * as O from 'fp-ts/Option';
import { BuildToolInfo } from '../../src/context/BuildToolInfo';

export const defaultOptions: OptionValues = {
	fullBuild: true
};
export const defaultCommandInfo: CommandInfo = {
	type: CommandType.FULL_BUILD
};
export const defaultBuildToolInfo: BuildToolInfo = {
	group: 'craigmiller160',
	name: 'craig-build',
	version: '2.0.0',
	isPreRelease: false
};

const defaultBuildContext: BuildContext = {
	options: defaultOptions,
	commandInfo: O.some(defaultCommandInfo),
	buildToolInfo: O.some(defaultBuildToolInfo)
};

export const createBuildContext = ({
	options = defaultOptions,
	commandInfo = O.some(defaultCommandInfo),
	buildToolInfo = O.some(defaultBuildToolInfo)
}: Partial<BuildContext> = defaultBuildContext): BuildContext => ({
	options,
	commandInfo,
	buildToolInfo
});
