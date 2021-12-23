import { Stage } from './Stage';
import { getCommandInfo } from './getCommandInfo';
import { getBuildToolInfo } from './getBuildToolInfo';
import { validateBuildToolVersion } from './validateBuildToolVersion';
import { checkForUncommittedChanges } from './checkForUncommittedChanges';
import { getProjectType } from './getProjectType';
import { getProjectInfo } from './getProjectInfo';
import { validateDependencyVersions } from './validateDependencyVersions';

export const STAGES: Stage[] = [
	getCommandInfo,
	getBuildToolInfo,
	validateBuildToolVersion,
	checkForUncommittedChanges,
	getProjectType,
	getProjectInfo,
	validateDependencyVersions
];
