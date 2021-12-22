import { Stage } from './Stage';
import { getCommandInfo } from './getCommandInfo';
import { getBuildToolInfo } from './getBuildToolInfo';
import { validateBuildToolVersion } from './validateBuildToolVersion';

export const STAGES: Stage[] = [
	getCommandInfo,
	getBuildToolInfo,
	validateBuildToolVersion
];
