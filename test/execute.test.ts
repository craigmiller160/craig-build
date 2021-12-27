import {
	createBuildContext,
	createIncompleteBuildContext
} from './testutils/createBuildContext';
import '@relmify/jest-fp-ts';
import { ConditionalStage, SetupStage } from '../src/stages/Stage';
import { IncompleteBuildContext } from '../src/context/IncompleteBuildContext';
import * as O from 'fp-ts/Option';
import { CommandType } from '../src/context/CommandType';
import { BuildContext } from '../src/context/BuildContext';
import { ProjectType } from '../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { conditionalStages, setupStages } from '../src/stages';

const setupStageExecuteFn = jest.fn();
const conditionalStageExecuteFn = jest.fn();

const createSetupStageMock = (stage: SetupStage): SetupStage => ({
	name: stage.name,
	execute: setupStageExecuteFn
});

const createConditionalStageMock = (
	stage: ConditionalStage
): ConditionalStage => ({
	name: stage.name,
	execute: conditionalStageExecuteFn,
	commandAllowsStage: stage.commandAllowsStage,
	projectAllowsStage: stage.projectAllowsStage
});

const baseIncompleteContext = createIncompleteBuildContext();
const baseContext = createBuildContext();

const setupStagesWithMocks = setupStages.map(createSetupStageMock)
const conditionalStagesWithMocks = conditionalStages.map(createConditionalStageMock);

describe('execute', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes full build for release MavenApplication', () => {
		const incompleteContext: IncompleteBuildContext = {
			...baseIncompleteContext,
			commandInfo: O.some({
				type: CommandType.FULL_BUILD
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
		setupStageExecuteFn.mockImplementation(() =>
			TE.right(incompleteContext)
		);
		conditionalStageExecuteFn.mockImplementation(() => TE.right(context));

		throw new Error();
	});

	it('executes full build for pre-release MavenApplication', () => {
		throw new Error();
	});

	it('executes full build for release MavenLibrary', () => {
		throw new Error();
	});

	it('executes full build for pre-release MavenLibrary', () => {
		throw new Error();
	});

	it('executes full build for release NpmApplication', () => {
		throw new Error();
	});

	it('executes full build for pre-release NpmApplication', () => {
		throw new Error();
	});

	it('executes full build for release NpmLibrary', () => {
		throw new Error();
	});

	it('executes full build for pre-release NpmLibrary', () => {
		throw new Error();
	});

	it('executes full build for release NpmApplication', () => {
		throw new Error();
	});

	it('executes full build for pre-release NpmApplication', () => {
		throw new Error();
	});
});
