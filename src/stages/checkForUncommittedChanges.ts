import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	// TODO finish this
	throw new Error();
};

export const checkForUncommittedChanges: Stage = {
	name: 'Check For Uncommitted Changes',
	execute
};
