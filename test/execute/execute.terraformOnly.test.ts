import { prepareStageExecutionMock, validateStages } from './executeTestUtils';
import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { CommandType } from '../../src/context/CommandType';
import { ProjectType } from '../../src/context/ProjectType';
import { VersionType } from '../../src/context/VersionType';
import { execute } from '../../src/execute';
import { terraformOnly_release_mavenApplication } from '../expectedExecutions/terraformOnly_release_mavenApplication';

const baseContext = createBuildContext();

describe('execute.terraformOnly', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	it('executes terraform only for MavenApplication without terraform', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(terraformOnly_release_mavenApplication);
	});

	it('executes terraform only for MavenApplication with terraform', async () => {
		throw new Error();
	});
});
