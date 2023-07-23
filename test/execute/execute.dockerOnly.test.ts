import { createBuildContext } from '../testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { prepareStageExecutionMock, validateStages } from './executeTestUtils';
import { CommandType } from '../../src/context/CommandType';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { execute } from '../../src/execute';
import { dockerOnly_release_mavenApplication } from '../expectedExecutions/dockerOnly_release_mavenApplication';
import { dockerOnly_preRelease_mavenApplication } from '../expectedExecutions/dockerOnly_preRelease_mavenApplication';
import { dockerOnly_release_mavenLibrary } from '../expectedExecutions/dockerOnly_release_mavenLibrary';
import { dockerOnly_preRelease_mavenLibrary } from '../expectedExecutions/dockerOnly_preRelease_mavenLibrary';
import { dockerOnly_release_npmApplication } from '../expectedExecutions/dockerOnly_release_npmApplication';
import { dockerOnly_preRelease_npmApplication } from '../expectedExecutions/dockerOnly_preRelease_npmApplication';
import { dockerOnly_release_npmLibrary } from '../expectedExecutions/dockerOnly_release_npmLibrary';
import { dockerOnly_preRelease_npmLibrary } from '../expectedExecutions/dockerOnly_preRelease_npmLibrary';
import { dockerOnly_release_dockerApplication } from '../expectedExecutions/dockerOnly_release_dockerApplication';
import { dockerOnly_preRelease_dockerApplication } from '../expectedExecutions/dockerOnly_preRelease_dockerApplication';
import { dockerOnly_release_dockerImage } from '../expectedExecutions/dockerOnly_release_dockerImage';
import { dockerOnly_preRelease_dockerImage } from '../expectedExecutions/dockerOnly_preRelease_dockerImage';

import { VersionType } from '../../src/context/VersionType';

import { dockerOnly_release_helmLibrary } from '../expectedExecutions/dockerOnly_release_helmLibrary';
import { dockerOnly_release_helmApplication } from '../expectedExecutions/dockerOnly_release_helmApplication';
import { dockerOnly_release_mavenApplication_terraform } from '../expectedExecutions/dockerOnly_release_mavenApplication_terraform';

const baseContext = createBuildContext();

describe('execute.fullBuild', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes docker only for release MavenApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_mavenApplication);
	});

	it('executes docker only for pre-release MavenApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_preRelease_mavenApplication);
	});

	it('executes docker only for release MavenLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_mavenLibrary);
	});

	it('executes docker only for pre-release MavenLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_preRelease_mavenLibrary);
	});

	it('executes docker only for release NpmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_npmApplication);
	});

	it('executes docker only for pre-release NpmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_preRelease_npmApplication);
	});

	it('executes docker only for release NpmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_npmLibrary);
	});

	it('executes docker only for pre-release NpmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_preRelease_npmLibrary);
	});

	it('executes docker only for release DockerApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_dockerApplication);
	});

	it('executes docker only for pre-release DockerApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_preRelease_dockerApplication);
	});

	it('executes docker only for release DockerImage', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_dockerImage);
	});

	it('executes docker only for pre-release DockerImage', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_preRelease_dockerImage);
	});

	it('executes docker only for release HelmLibrary', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_helmLibrary);
	});

	it('executes docker only for release HelmApplication', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_helmApplication);
	});

	it('executes docker only for release MavenApplication with terraform', async () => {
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.DockerOnly
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

		validateStages(dockerOnly_release_mavenApplication_terraform);
	});

	it('executes docker only for release GradleApplication', async () => {
		throw new Error();
	});

	it('executes docker only for pre-release GradleLibrary', async () => {
		throw new Error();
	});

	it('executes docker only for release GradleLibrary', async () => {
		throw new Error();
	});

	it('executes docker only for pre-release GradleLibrary', async () => {
		throw new Error();
	});
});
