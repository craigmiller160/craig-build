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

export const fullBuild_release_npmLibrary: ExpectedExecution = {
	[validateDependencyVersions.name]: true,
	[validateProjectVersionAllowed.name]: true,
	[validateKubernetesConfig.name]: false,
	[validateGitTag.name]: true,
	[buildArtifact.name]: true,
	[preparePreReleaseVersion.name]: false,
	[manuallyPublishArtifact.name]: true,
	[gitTag.name]: true,
	[downloadArtifactForDeployment.name]: false,
	[buildAndPushDocker.name]: false,
	[deployToKubernetes.name]: false
};
