import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const buildArtifact: Stage = {
	name: 'Build Artifact',
	execute
};
