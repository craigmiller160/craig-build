import { getCommandInfo } from './getCommandInfo';
import { getBuildToolInfo } from './getBuildToolInfo';
import { validateBuildToolVersion } from './validateBuildToolVersion';
import { checkForUncommittedChanges } from './checkForUncommittedChanges';
import { getProjectType } from './getProjectType';
import { getProjectInfo } from './getProjectInfo';
import { validateProjectVersionAllowed } from './validateProjectVersionAllowed';
import { validateDependencyVersions } from './validateDependencyVersions';
import { validateGitTag } from './validateGitTag';
import { buildArtifact } from './buildArtifact';
import { preparePreReleaseVersion } from './preparePreReleaseVersion';
import { manuallyPublishArtifact } from './manuallyPublishArtifact';
import { gitTag } from './gitTag';
import { downloadArtifactForDeployment } from './downloadArtifactForDeployment';
import { buildAndPushDocker } from './buildAndPushDocker';
import { deployToKubernetes } from './deployToKubernetes';
import { Stage } from './Stage';
import { waitOnNexusUpdate } from './waitOnNexusUpdate';

export const stages: Stage[] = [
	getCommandInfo,
	getBuildToolInfo,
	validateBuildToolVersion,
	checkForUncommittedChanges,
	getProjectType,
	getProjectInfo,
	validateDependencyVersions,
	validateProjectVersionAllowed,
	// validateKubernetesConfig,
	validateGitTag,
	buildArtifact,
	preparePreReleaseVersion,
	manuallyPublishArtifact,
	gitTag,
	waitOnNexusUpdate,
	downloadArtifactForDeployment,
	buildAndPushDocker,
	deployToKubernetes
];
