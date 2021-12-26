import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const buildAndPushDocker: Stage = {
	name: 'Build and Push Docker',
	execute
};
