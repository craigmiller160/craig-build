import { EarlyStage, Stage } from './Stage';
import { getCommandInfo } from './getCommandInfo';
import { getBuildToolInfo } from './getBuildToolInfo';
import { validateBuildToolVersion } from './validateBuildToolVersion';
import { checkForUncommittedChanges } from './checkForUncommittedChanges';
import { getProjectType } from './getProjectType';
import { getProjectInfo } from './getProjectInfo';
import { validateProjectVersionAllowed } from './validateProjectVersionAllowed';
import { validateDependencyVersions } from './validateDependencyVersions';
import { validateKubernetesConfig } from './validateKubernetesConfig';
import { validateGitTag } from './validateGitTag';
import { buildArtifact } from './buildArtifact';
import { preparePreReleaseVersion } from './preparePreReleaseVersion';
import { manuallyPublishArtifact } from './manuallyPublishArtifact';
import { gitTag } from './gitTag';
import { downloadArtifactForDeployment } from './downloadArtifactForDeployment';
import { buildAndPushDocker } from './buildAndPushDocker';
import { deployToKubernetes } from './deployToKubernetes';

export const EARLY_STAGES: EarlyStage[] = [
	getCommandInfo,
	getBuildToolInfo,
	validateBuildToolVersion,
	checkForUncommittedChanges,
	getProjectType,
	getProjectInfo
];

export const STAGES: Stage[] = [
	validateDependencyVersions,
	validateProjectVersionAllowed,
	validateKubernetesConfig,
	validateGitTag,
	buildArtifact,
	preparePreReleaseVersion,
	manuallyPublishArtifact,
	gitTag,
	downloadArtifactForDeployment,
	buildAndPushDocker,
	deployToKubernetes
];
