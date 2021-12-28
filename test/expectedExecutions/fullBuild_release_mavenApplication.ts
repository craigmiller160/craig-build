import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';
import { validateKubernetesConfig } from '../../src/stages/validateKubernetesConfig';
import { validateGitTag } from '../../src/stages/validateGitTag';
import { buildArtifact } from '../../src/stages/buildArtifact';
import { preparePreReleaseVersion } from '../../src/stages/preparePreReleaseVersion';
import { manuallyPublishArtifact } from '../../src/stages/manuallyPublishArtifact';
import { gitTag } from '../../src/stages/gitTag';
import { downloadArtifactForDeployment } from '../../src/stages/downloadArtifactForDeployment';
import { buildAndPushDocker } from '../../src/stages/buildAndPushDocker';
import { deployToKubernetes } from '../../src/stages/deployToKubernetes';
import { ExpectedExecution } from './ExpectedExecution';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import { getBuildToolInfo } from '../../src/stages/getBuildToolInfo';
import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';
import checkForUncommittedChanges from '../../old-src/stages/identify/tasks/checkForUncommittedChanges';
import { getProjectType } from '../../src/stages/getProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';

// TODO how to make this an interface?
export const fullBuild_release_mavenApplication: ExpectedExecution = {
	[getCommandInfo.name]: true,
	[getBuildToolInfo.name]: true,
	[validateBuildToolVersion.name]: true,
	[checkForUncommittedChanges.name]: true,
	[getProjectType.name]: true,
	[getProjectInfo.name]: true,
	[validateDependencyVersions.name]: true,
	[validateProjectVersionAllowed.name]: true,
	[validateKubernetesConfig.name]: true,
	[validateGitTag.name]: true,
	[buildArtifact.name]: true,
	[preparePreReleaseVersion.name]: false,
	[manuallyPublishArtifact.name]: false,
	[gitTag.name]: true,
	[downloadArtifactForDeployment.name]: true,
	[buildAndPushDocker.name]: true,
	[deployToKubernetes.name]: true
};
