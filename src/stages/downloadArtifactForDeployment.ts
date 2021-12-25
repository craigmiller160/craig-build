import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const downloadArtifactForDeployment: Stage = {
	name: 'Download Artifact',
	execute
};
