import { STAGES } from '../../src/stages';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import { getBuildToolInfo } from '../../src/stages/getBuildToolInfo';
import { validateBuildToolVersion } from '../../src/stages/validateBuildToolVersion';
import { getProjectType } from '../../src/stages/getProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import { checkForUncommittedChanges } from '../../src/stages/checkForUncommittedChanges';
import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';

describe('stages', () => {
	it('all stages are added in the correct order', () => {
		const stageNames = STAGES.map((_) => _.name);
		expect(stageNames).toEqual([
			getCommandInfo.name,
			getBuildToolInfo.name,
			validateBuildToolVersion.name,
			checkForUncommittedChanges.name,
			getProjectType.name,
			getProjectInfo.name,
			validateDependencyVersions.name,
			validateProjectVersionAllowed.name
		]);
	});
});
