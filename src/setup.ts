import * as O from 'fp-ts/Option';
import { IncompleteBuildContext } from './context/IncompleteBuildContext';

export const setupBuildContext = (): IncompleteBuildContext => ({
	commandInfo: O.none,
	buildToolInfo: O.none,
	projectType: O.none,
	projectInfo: O.none
});
