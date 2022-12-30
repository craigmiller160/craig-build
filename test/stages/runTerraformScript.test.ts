import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';

describe('runTerraformScript', () => {
	it('executes the terraform script', async () => {
		getCwdMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenReleaseApplicationWithTerraform')
		);
		throw new Error();
	});
});
