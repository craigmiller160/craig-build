import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const manuallyPublishArtifact: Stage = {
	name: 'Manually Publish Artifact',
	execute
};
