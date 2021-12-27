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

export const fullBuild_preRelease_mavenLibrary: ExpectedExecution = {
	[validateDependencyVersions.name]: false,
	[validateProjectVersionAllowed.name]: false,
	[validateKubernetesConfig.name]: false,
	[validateGitTag.name]: false,
	[buildArtifact.name]: true,
	[preparePreReleaseVersion.name]: true,
	[manuallyPublishArtifact.name]: false,
	[gitTag.name]: false,
	[downloadArtifactForDeployment.name]: false,
	[buildAndPushDocker.name]: false,
	[deployToKubernetes.name]: false
};
