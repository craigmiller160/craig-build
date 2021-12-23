import { EarlyStage, Stage } from './Stage';
import { getCommandInfo } from './getCommandInfo';
import { getBuildToolInfo } from './getBuildToolInfo';
import { validateBuildToolVersion } from './validateBuildToolVersion';
import { checkForUncommittedChanges } from './checkForUncommittedChanges';
import { getProjectType } from './getProjectType';
import { getProjectInfo } from './getProjectInfo';
import { validateProjectVersionAllowed } from './validateProjectVersionAllowed';
import { validateDependencyVersions } from './validateDependencyVersions';

export const EARLY_STAGES: EarlyStage[] = [
	getCommandInfo,
	getBuildToolInfo,
	validateBuildToolVersion,
	checkForUncommittedChanges,
	getProjectType,
	getProjectInfo
];

export const STAGES: Stage[] = [
	validateDependencyVersions,
	validateProjectVersionAllowed
];
