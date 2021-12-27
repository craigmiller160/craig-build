import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const deployToKubernetes: Stage = {
	name: 'Deploy to Kubernetes',
	execute
};
