import { createBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { CommandType } from '../../src/context/CommandType';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { execute } from '../../src/execute';
import { kubernetesOnly_release_mavenApplication } from '../expectedExecutions/kubernetesOnly_release_mavenApplication';
import { ExpectedExecution } from '../expectedExecutions/ExpectedExecution';
import { kubernetesOnly_preRelease_mavenApplication } from '../expectedExecutions/kubernetesOnly_preRelease_mavenApplication';
import { kubernetesOnly_release_mavenLibrary } from '../expectedExecutions/kubernetesOnly_release_mavenLibrary';
import { kubernetesOnly_preRelease_mavenLibrary } from '../expectedExecutions/kubernetesOnly_preRelease_mavenLibrary';
import { kubernetesOnly_release_npmApplication } from '../expectedExecutions/kubernetesOnly_release_npmApplication';
import { kubernetesOnly_preRelease_npmApplication } from '../expectedExecutions/kubernetesOnly_preRelease_npmApplication';
import { kubernetesOnly_release_npmLibrary } from '../expectedExecutions/kubernetesOnly_release_npmLibrary';
import { kubernetesOnly_preRelease_npmLibrary } from '../expectedExecutions/kubernetesOnly_preRelease_npmLibrary';
import { kubernetesOnly_release_dockerApplication } from '../expectedExecutions/kubernetesOnly_release_dockerApplication';
import { kubernetesOnly_preRelease_dockerApplication } from '../expectedExecutions/kubernetesOnly_preRelease_dockerApplication';
import { kubernetesOnly_release_dockerImage } from '../expectedExecutions/kubernetesOnly_release_dockerImage';
import { kubernetesOnly_preRelease_dockerImage } from '../expectedExecutions/kubernetesOnly_preRelease_dockerImage';
import { Stage } from '../../src/stages/Stage';
import { stages } from '../../src/stages';
import { VersionType } from '../../src/context/VersionType';
import { kubernetesOnly_release_helmLibrary } from '../expectedExecutions/kubernetesOnly_release_helmLibrary';
import { kubernetesOnly_release_helmApplication } from '../expectedExecutions/kubernetesOnly_release_helmApplication';

jest.mock('../../src/stages', () => {
	const createStageMock = (stage: Stage): Stage => ({
		name: stage.name,
		execute: jest.fn(),
		shouldStageExecute: stage.shouldStageExecute
	});

	const { stages } = jest.requireActual('../../src/stages');
	return {
		stages: stages.map(createStageMock)
	};
});

const baseContext = createBuildContext();
const prepareStageExecutionMock = (context: BuildContext) => {
	stages.forEach((stage) => {
		(stage.execute as jest.Mock).mockImplementation(() =>
			TE.right(context)
		);
	});
};

const validateStages = (expected: ExpectedExecution) => {
	expect(Object.keys(expected)).toHaveLength(stages.length);
	stages.forEach((stage) => {
		try {
			const expectedValue = expected[stage.name];
			expect(expectedValue).not.toBeUndefined();
			if (expectedValue) {
				expect(stage.execute).toHaveBeenCalled();
			} else {
				expect(stage.execute).not.toHaveBeenCalled();
			}
		} catch (ex) {
			throw new Error(
				`Error validating state: ${stage.name}.\n${
					(ex as Error).message
				}`,
				{
					cause: ex
				}
			);
		}
	});
};

describe('execute.kubernetesOnly', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes kubernetes only for release MavenApplication', async () => {
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

		validateStages(kubernetesOnly_release_mavenApplication);
	});

	it('executes kubernetes only for pre-release MavenApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.PreRelease
			}
		};
		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_preRelease_mavenApplication);
	});

	it('executes kubernetes only for release MavenLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.MavenLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_mavenLibrary);
	});

	it('executes kubernetes only for pre-release MavenLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.MavenLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.PreRelease
			}
		};
		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_preRelease_mavenLibrary);
	});

	it('executes kubernetes only for release NpmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_npmApplication);
	});

	it('executes kubernetes only for pre-release NpmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.PreRelease
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_preRelease_npmApplication);
	});

	it('executes kubernetes only for release NpmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.NpmLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_npmLibrary);
	});

	it('executes kubernetes only for pre-release NpmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.NpmLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.PreRelease
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_preRelease_npmLibrary);
	});

	it('executes kubernetes only for release DockerApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_dockerApplication);
	});

	it('executes kubernetes only for pre-release DockerApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.PreRelease
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_preRelease_dockerApplication);
	});

	it('executes kubernetes only for release DockerImage', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.DockerImage,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_dockerImage);
	});

	it('executes kubernetes only for pre-release DockerImage', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.DockerImage,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.PreRelease
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_preRelease_dockerImage);
	});

	it('executes kubernetes only only for release HelmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.HelmLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_helmLibrary);
	});

	it('executes kubernetes only only for release HelmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			},
			projectType: ProjectType.HelmApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			}
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(kubernetesOnly_release_helmApplication);
	});

	it('executes kubernetes only for release MavenApplication with terraform', async () => {
		throw new Error();
	});
});
