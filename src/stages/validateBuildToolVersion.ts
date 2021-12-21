import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';

const execute: StageFunction = (context: BuildContext) => {};

export const validateBuildToolVersion: Stage = {
	name: 'Validate Build Tool Version',
	execute
};
