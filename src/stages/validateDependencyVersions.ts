import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute
};
