import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const validateKubernetesConfig: Stage = {
	name: 'Validate Kubernetes Config',
	execute
};
