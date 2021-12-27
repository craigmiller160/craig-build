import { createBuildContext, createIncompleteBuildContext } from './testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { ConditionalStage, SetupStage } from '../src/stages/Stage';
import { IncompleteBuildContext } from '../src/context/IncompleteBuildContext';
import * as O from 'fp-ts/Option';
import { CommandType } from '../src/context/CommandType';
import { BuildContext } from '../src/context/BuildContext';
import { ProjectType } from '../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { conditionalStages, setupStages } from '../src/stages';
import { execute } from '../src/execute';
import { fullBuild_release_mavenApplication } from './expectedExecutions/fullBuild_release_mavenApplication';
import { ExpectedExecution } from './expectedExecutions/ExpectedExecution';
import { fullBuild_preRelease_mavenApplication } from './expectedExecutions/fullBuild_preRelease_mavenApplication';
import { fullBuild_release_mavenLibrary } from './expectedExecutions/fullBuild_release_mavenLibrary';
import { fullBuild_preRelease_mavenLibrary } from './expectedExecutions/fullBuild_preRelease_mavenLibrary';
import { fullBuild_release_npmApplication } from './expectedExecutions/fullBuild_release_npmApplication';
import { fullBuild_preRelease_npmApplication } from './expectedExecutions/fullBuild_preRelease_npmApplication';
import { fullBuild_release_npmLibrary } from './expectedExecutions/fullBuild_release_npmLibrary';
import { fullBuild_preRelease_npmLibrary } from './expectedExecutions/fullBuild_preRelease_npmLibrary';

jest.mock('../src/stages', () => {
	const createSetupStageMock = (stage: SetupStage): SetupStage => ({
		name: stage.name,
		execute: jest.fn()
	});

	const createConditionalStageMock = (
		stage: ConditionalStage
	): ConditionalStage => ({
		name: stage.name,
		execute: jest.fn(),
		commandAllowsStage: stage.commandAllowsStage,
		projectAllowsStage: stage.projectAllowsStage
	});

	const { conditionalStages, setupStages } =
		jest.requireActual('../src/stages');
	return {
		conditionalStages: conditionalStages.map(createConditionalStageMock),
		setupStages: setupStages.map(createSetupStageMock)
	};
});

const baseIncompleteContext = createIncompleteBuildContext();
const baseContext = createBuildContext();

const prepareSetupStageExecutionMock = (context: IncompleteBuildContext) => {
	setupStages.forEach((stage) => {
		(stage.execute as jest.Mock).mockImplementation(() =>
			TE.right(context)
		);
	});
};
const prepareConditionalStageExecutionMock = (context: BuildContext) => {
	conditionalStages.forEach((stage) => {
		(stage.execute as jest.Mock).mockImplementation(() =>
			TE.right(context)
		);
	});
};

const validateSetupStages = () => {
	setupStages.forEach((stage) => {
		expect(stage.execute).toHaveBeenCalled();
	});
};

// TODO need type for this once interface is figured out
const validateConditionalStages = (expected: ExpectedExecution) => {
	expect(Object.keys(expected)).toHaveLength(conditionalStages.length);
	conditionalStages.forEach((stage) => {
		try {
			const expectedValue = expected[stage.name];
			expect(expectedValue).not.toBeUndefined();
			if (expectedValue) {
				expect(stage.execute).toHaveBeenCalled();
			} else {
				expect(stage.execute).not.toHaveBeenCalled();
			}
		} catch (ex) {
			console.error('ERROR WITH STAGE', stage.name);
			throw ex;
		}
	});
};

describe('execute', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes full build for release MavenApplication', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.MavenApplication),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: false
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: false
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_release_mavenApplication);
	});

	it('executes full build for pre-release MavenApplication', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.MavenApplication),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: true
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: true
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_preRelease_mavenApplication);
	});

	it('executes full build for release MavenLibrary', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.MavenLibrary),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: false
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.MavenLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: false
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_release_mavenLibrary);
	});

	it('executes full build for pre-release MavenLibrary', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.MavenLibrary),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: true
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.MavenLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: true
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_preRelease_mavenLibrary);
	});

	it('executes full build for release NpmApplication', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.NpmApplication),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: false
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: false
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_release_npmApplication);
	});

	it('executes full build for pre-release NpmApplication', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.NpmApplication),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: true
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: true
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_preRelease_npmApplication);
	});

	it('executes full build for release NpmLibrary', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.NpmLibrary),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: false
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.NpmLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: false
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_release_npmLibrary);
	});

	it('executes full build for pre-release NpmLibrary', async () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
			}),
			projectType: O.some(ProjectType.NpmLibrary),
			projectInfo: O.some({
				...baseContext.projectInfo,
				isPreRelease: true
			})
		};
		const context: BuildContext = {
			...baseContext,
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			projectType: ProjectType.NpmLibrary,
			projectInfo: {
				...baseContext.projectInfo,
				isPreRelease: true
			}
		};
		prepareSetupStageExecutionMock(incompleteContext);
		prepareConditionalStageExecutionMock(context);

		const result = await execute(incompleteContext)();
		expect(result).toEqualRight(context);

		validateSetupStages();
		validateConditionalStages(fullBuild_preRelease_npmLibrary);
	});

	it('executes full build for release NpmApplication', async () => {
		throw new Error();
	});

	it('executes full build for pre-release NpmApplication', async () => {
		throw new Error();
	});
});
