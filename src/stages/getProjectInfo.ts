import { Stage, StageFunction } from './Stage';

// TODO what do I do about dependencies?

const execute: StageFunction = (context) => {
	throw new Error();
};

export const getProjectInfo: Stage = {
	name: 'Get Project Info',
	execute
};
