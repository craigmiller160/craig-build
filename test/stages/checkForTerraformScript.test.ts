import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { checkForTerraformScript } from '../../src/stages/checkForTerraformScript';

const baseBuildContext = createBuildContext();

describe('checkForTerraformScript', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('is application with terraform script', async () => {
		getCwdMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenReleaseApplicationWithTerraform')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};
		const expectedContext: BuildContext = {
			...buildContext,
			hasTerraform: true
		};

		const result = await checkForTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is application without terraform script', async () => {
		getCwdMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenReleaseApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const result = await checkForTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});
});
