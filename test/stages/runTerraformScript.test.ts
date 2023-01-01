import { getCwdMock } from '../testutils/getCwdMock';
import { runCommandMock } from '../testutils/runCommandMock';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { BuildContext } from '../../src/context/BuildContext';
import { createBuildContext } from '../testutils/createBuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runTerraformScript } from '../../src/stages/runTerraformScript';
import '@relmify/jest-fp-ts';

describe('runTerraformScript', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes the terraform script', async () => {
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraform'
		);
		getCwdMock.mockImplementation(() => workingDir);
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'terraform apply', {
			printOutput: true,
			cwd: path.join(workingDir, 'deploy', 'terraform')
		});
		throw new Error('Need user input too');
	});
});
