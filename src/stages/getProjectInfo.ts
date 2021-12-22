import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const getProjectInfo: Stage = {
	name: 'Get Project Info',
	execute
};
