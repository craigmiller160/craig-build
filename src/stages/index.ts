import { Stage } from './Stage';
import { getCommandInfo } from './getCommandInfo';
import { getBuildToolInfo } from './getBuildToolInfo';

export const STAGES: Stage[] = [getCommandInfo, getBuildToolInfo];
