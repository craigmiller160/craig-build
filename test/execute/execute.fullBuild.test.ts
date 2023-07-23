import { prepareStageExecutionMock, validateStages } from './executeTestUtils';
import { createBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { CommandType } from '../../src/context/CommandType';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { execute } from '../../src/execute';
import { fullBuild_release_mavenApplication } from '../expectedExecutions/fullBuild_release_mavenApplication';
import { fullBuild_preRelease_mavenApplication } from '../expectedExecutions/fullBuild_preRelease_mavenApplication';
import { fullBuild_release_mavenLibrary } from '../expectedExecutions/fullBuild_release_mavenLibrary';
import { fullBuild_preRelease_mavenLibrary } from '../expectedExecutions/fullBuild_preRelease_mavenLibrary';
import { fullBuild_release_npmApplication } from '../expectedExecutions/fullBuild_release_npmApplication';
import { fullBuild_preRelease_npmApplication } from '../expectedExecutions/fullBuild_preRelease_npmApplication';
import { fullBuild_release_npmLibrary } from '../expectedExecutions/fullBuild_release_npmLibrary';
import { fullBuild_preRelease_npmLibrary } from '../expectedExecutions/fullBuild_preRelease_npmLibrary';
import { fullBuild_release_dockerApplication } from '../expectedExecutions/fullBuild_release_dockerApplication';
import { fullBuild_preRelease_dockerApplication } from '../expectedExecutions/fullBuild_preRelease_dockerApplication';
import { fullBuild_release_dockerImage } from '../expectedExecutions/fullBuild_release_dockerImage';
import { fullBuild_preRelease_dockerImage } from '../expectedExecutions/fullBuild_preRelease_dockerImage';
import { VersionType } from '../../src/context/VersionType';
import { fullBuild_release_helmLibrary } from '../expectedExecutions/fullBuild_release_helmLibrary';
import { fullBuild_release_helmApplication } from '../expectedExecutions/fullBuild_release_helmApplication';
import { fullBuild_release_mavenApplication_terraform } from '../expectedExecutions/fullBuild_release_mavenApplication_terraform';

const baseContext = createBuildContext();

describe('execute.fullBuild', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes full build for release MavenApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_mavenApplication);
	});

	it('executes full build for pre-release MavenApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_preRelease_mavenApplication);
	});

	it('executes full build for release MavenLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_mavenLibrary);
	});

	it('executes full build for pre-release MavenLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_preRelease_mavenLibrary);
	});

	it('executes full build for release NpmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_npmApplication);
	});

	it('executes full build for pre-release NpmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_preRelease_npmApplication);
	});

	it('executes full build for release NpmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_npmLibrary);
	});

	it('executes full build for pre-release NpmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_preRelease_npmLibrary);
	});

	it('executes full build for release DockerApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_dockerApplication);
	});

	it('executes full build for pre-release DockerApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_preRelease_dockerApplication);
	});

	it('executes full build for release DockerImage', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_dockerImage);
	});

	it('executes full build for pre-release DockerImage', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_preRelease_dockerImage);
	});

	it('executes full build for release HelmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_helmLibrary);
	});

	it('executes full build for release HelmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
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

		validateStages(fullBuild_release_helmApplication);
	});

	it('executes full build for release MavenApplication with terraform', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			},
			hasTerraform: true
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);

		validateStages(fullBuild_release_mavenApplication_terraform);
	});

	it('executes full build for release GradleApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
			},
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseContext.projectInfo,
				versionType: VersionType.Release
			},
			hasTerraform: false
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);
		throw new Error();
	});

	it('executes full build for pre-release GradleApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FullBuild
			},
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseContext.projectInfo,
				version: '1.0.0-SNAPSHOT',
				versionType: VersionType.PreRelease
			},
			hasTerraform: false
		};

		prepareStageExecutionMock(context);

		const result = await execute(context)();
		expect(result).toEqualRight(context);
		throw new Error();
	});

	it('executes full build for release GradleLibrary', async () => {
		throw new Error();
	});

	it('executes full build for pre-release GradleLibrary', async () => {
		throw new Error();
	});
});
