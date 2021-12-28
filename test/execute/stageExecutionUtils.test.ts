import { createBuildContext } from '../testutils/createBuildContext';
import { Stage } from '../../src/stages/Stage';
import * as TE from 'fp-ts/TaskEither';
import {
	createStageExecution,
	executeIfAllowed,
	proceedIfCommandAllowed,
	proceedIfProjectAllowed
} from '../../src/execute/stageExecutionUtils';
import { StageExecutionStatus } from '../../src/execute/StageExecutionStatus';
import { StageExecution } from '../../src/execute/StageExecution';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import '@relmify/jest-fp-ts';

const baseContext = createBuildContext();
const mockStage: Stage = {
	name: 'Mock Stage',
	execute: () => TE.right(baseContext),
	commandAllowsStage: jest.fn(),
	projectAllowsStage: jest.fn()
};

describe('stageExecutionUtils', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('createStageExecution', () => {
		const execution = createStageExecution(mockStage);
		expect(execution).toEqual({
			stage: mockStage,
			status: StageExecutionStatus.Proceed
		});
	});

	describe('proceedIfCommandAllowed', () => {
		it('status is Proceed and commandAllowsStage returns true', () => {
			(mockStage.commandAllowsStage as jest.Mock).mockImplementation(
				() => true
			);
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.Proceed
			};
			const result = proceedIfCommandAllowed(baseContext)(execution);
			expect(result).toEqual(execution);
		});

		it('status is Proceed and commandAllowsStage returns false', () => {
			(mockStage.commandAllowsStage as jest.Mock).mockImplementation(
				() => false
			);
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.Proceed
			};
			const result = proceedIfCommandAllowed(baseContext)(execution);
			expect(result).toEqual({
				...execution,
				status: StageExecutionStatus.SkipForCommand
			});
		});

		it('status is SkipForProject', () => {
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.SkipForProject
			};
			const result = proceedIfCommandAllowed(baseContext)(execution);
			expect(result).toEqual({
				...execution,
				status: StageExecutionStatus.SkipForProject
			});
			expect(mockStage.commandAllowsStage).not.toHaveBeenCalled();
		});
	});

	describe('proceedIfProjectAllowed', () => {
		it('status is Proceed and projectAllowsStage returns true', () => {
			(mockStage.projectAllowsStage as jest.Mock).mockImplementation(
				() => true
			);
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.Proceed
			};
			const result = proceedIfProjectAllowed(baseContext)(execution);
			expect(result).toEqual(execution);
		});

		it('status is Proceed and projectAllowsStage returns false', () => {
			(mockStage.projectAllowsStage as jest.Mock).mockImplementation(
				() => false
			);
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.Proceed
			};
			const result = proceedIfProjectAllowed(baseContext)(execution);
			expect(result).toEqual({
				...execution,
				status: StageExecutionStatus.SkipForProject
			});
		});

		it('status is SkipForCommand', () => {
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.SkipForCommand
			};
			const result = proceedIfProjectAllowed(baseContext)(execution);
			expect(result).toEqual(execution);
			expect(mockStage.projectAllowsStage).not.toHaveBeenCalled();
		});
	});

	describe('executeIfAllowed', () => {
		const inputContext: BuildContext = {
			...baseContext,
			projectType: ProjectType.Unknown
		};

		it('status is Proceed', async () => {
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.Proceed
			};

			const result = await executeIfAllowed(inputContext)(execution)();
			expect(result).toEqualRight(baseContext);
		});

		it('status is SkipForCommand', async () => {
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.SkipForCommand
			};

			const result = await executeIfAllowed(inputContext)(execution)();
			expect(result).toEqualRight(inputContext);
		});

		it('status is SkipForProject', async () => {
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.SkipForProject
			};

			const result = await executeIfAllowed(inputContext)(execution)();
			expect(result).toEqualRight(inputContext);
		});
	});
});
