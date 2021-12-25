import { Stage, StageFunction } from './Stage';

export const NPM_PUBLISH_COMMAND =
	'yarn publish --no-git-tag-version --new-version';

export const CLEAR_FILES_COMMAND = 'git checkout .';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const manuallyPublishArtifact: Stage = {
	name: 'Manually Publish Artifact',
	execute
};
