import { describe, it, expect } from 'vitest';
import { stages } from '../../src/stages';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import { getBuildToolInfo } from '../../src/stages/getBuildToolInfo';
import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';
import { getProjectType } from '../../src/stages/getProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import { checkForUncommittedChanges } from '../../src/stages/checkForUncommittedChanges';
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
import { waitOnNexusUpdate } from '../../src/stages/waitOnNexusUpdate';
import { runTerraformScript } from '../../src/stages/runTerraformScript';
import { checkForTerraformScript } from '../../src/stages/checkForTerraformScript';
import { validateMonorepoVersions } from '../../src/stages/validateMonorepoVersions';

describe('stages', () => {
	it('all stages are added in the correct order', () => {
		const stageNames = stages.map((_) => _.name);
		expect(stageNames).toEqual([
			getCommandInfo.name,
			getBuildToolInfo.name,
			validateBuildToolVersion.name,
			checkForUncommittedChanges.name,
			getProjectType.name,
			getProjectInfo.name,
			checkForTerraformScript.name,
			validateMonorepoVersions.name,
			validateDependencyVersions.name,
			validateProjectVersionAllowed.name,
			// validateKubernetesConfig.name,
			validateGitTag.name,
			buildArtifact.name,
			preparePreReleaseVersion.name,
			manuallyPublishArtifact.name,
			gitTag.name,
			waitOnNexusUpdate.name,
			downloadArtifactForDeployment.name,
			buildAndPushDocker.name,
			deployToKubernetes.name,
			runTerraformScript.name
		]);
	});
});
