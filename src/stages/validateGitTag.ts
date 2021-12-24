import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const validateGitTag: Stage = {
	name: 'Validate Git Tag',
	execute
};
