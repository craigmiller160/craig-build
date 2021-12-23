import { BuildContext } from './context/BuildContext';
import * as O from 'fp-ts/Option';

export const setupBuildContext = (): BuildContext => ({
	commandInfo: O.none,
	buildToolInfo: O.none,
	projectType: O.none,
	projectInfo: O.none
});
