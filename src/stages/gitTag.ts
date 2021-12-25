import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const gitTag: Stage = {
	name: 'Git Tag',
	execute
};
