import { createBuildContext } from '../testutils/createBuildContext';
import { Stage } from '../../src/stages/Stage';
import * as TE from 'fp-ts/TaskEither';
import {
	createStageExecution,
	proceedIfCommandAllowed
} from '../../src/execute/stageExecutionUtils';
import { StageExecutionStatus } from '../../src/execute/StageExecutionStatus';
import { StageExecution } from '../../src/execute/StageExecution';

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
			throw new Error();
		});

		it('status is Proceed and projectAllowsStage returns false', () => {
			throw new Error();
		});

		it('status is SkipForCommand', () => {
			throw new Error();
		});
	});

	describe('executeIfAllowed', () => {
		it('status is Proceed', () => {
			throw new Error();
		});

		it('status is SkipForCommand', () => {
			throw new Error();
		});

		it('status is SkipForProject', () => {
			throw new Error();
		});
	});
});
