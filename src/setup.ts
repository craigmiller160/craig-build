import { OptionValues } from 'commander';
import { BuildContext } from './context/BuildContext';
import * as O from 'fp-ts/Option';

export const setupBuildContext = (options: OptionValues): BuildContext => ({
	options,
	commandInfo: O.none,
	buildToolInfo: O.none,
	projectType: O.none,
	projectInfo: O.none
});
