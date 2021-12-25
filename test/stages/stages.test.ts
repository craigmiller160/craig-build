import { EARLY_STAGES, STAGES } from '../../src/stages';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import { getBuildToolInfo } from '../../src/stages/getBuildToolInfo';
import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';
import { getProjectType } from '../../src/stages/getProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import { checkForUncommittedChanges } from '../../src/stages/checkForUncommittedChanges';
import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';
import { validateKubernetesConfig } from '../../src/stages/validateKubernetesConfig';
import { validateGitTag } from '../../src/stages/validateGitTag';
import { buildArtifact } from '../../src/stages/buildArtifact';
import { preparePreReleaseVersion } from '../../src/stages/preparePreReleaseVersion';
import { manuallyPublishArtifact } from '../../src/stages/manuallyPublishArtifact';
import { gitTag } from '../../src/stages/gitTag';
import { downloadArtifact } from '../../src/stages/downloadArtifact';

describe('stages', () => {
	it('all early stages are added in the correct order', () => {
		const stageNames = EARLY_STAGES.map((_) => _.name);
		expect(stageNames).toEqual([
			getCommandInfo.name,
			getBuildToolInfo.name,
			validateBuildToolVersion.name,
			checkForUncommittedChanges.name,
			getProjectType.name,
			getProjectInfo.name
		]);
	});

	it('all main stages are added in the correct order', () => {
		const stageNames = STAGES.map((_) => _.name);
		expect(stageNames).toEqual([
			validateDependencyVersions.name,
			validateProjectVersionAllowed.name,
			validateKubernetesConfig.name,
			validateGitTag.name,
			buildArtifact.name,
			preparePreReleaseVersion.name,
			manuallyPublishArtifact.name,
			gitTag.name,
			downloadArtifact.name
		]);
	});
});
