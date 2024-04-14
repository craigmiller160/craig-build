import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';
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
import { checkForUncommittedChanges } from '../../src/stages/checkForUncommittedChanges';
import { getProjectType } from '../../src/stages/getProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import { waitOnNexusUpdate } from '../../src/stages/waitOnNexusUpdate';
import { runTerraformScript } from '../../src/stages/runTerraformScript';
import { checkForTerraformScript } from '../../src/stages/checkForTerraformScript';
import { validateMonorepoVersions } from '../../src/stages/validateMonorepoVersions';

export const dockerOnly_preRelease_gradleApplication: ExpectedExecution = {
	[getCommandInfo.name]: true,
	[getBuildToolInfo.name]: true,
	[validateBuildToolVersion.name]: true,
	[checkForUncommittedChanges.name]: true,
	[getProjectType.name]: true,
	[getProjectInfo.name]: true,
	[checkForTerraformScript.name]: true,
	[validateMonorepoVersions.name]: true,
	[validateDependencyVersions.name]: false,
	[validateProjectVersionAllowed.name]: false,
	// [validateKubernetesConfig.name]: true,
	[validateGitTag.name]: false,
	[buildArtifact.name]: false,
	[preparePreReleaseVersion.name]: true,
	[manuallyPublishArtifact.name]: false,
	[gitTag.name]: false,
	[waitOnNexusUpdate.name]: true,
	[downloadArtifactForDeployment.name]: true,
	[buildAndPushDocker.name]: true,
	[deployToKubernetes.name]: true,
	[runTerraformScript.name]: false
};
