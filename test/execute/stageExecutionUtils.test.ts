import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { createBuildContext } from '../testutils/createBuildContext';
import { Stage } from '../../src/stages/Stage';
import { predicate, taskEither } from 'fp-ts';
import {
	createStageExecution,
	executeIfAllowed,
	shouldStageExecute
} from '../../src/execute/stageExecutionUtils';
import { StageExecutionStatus } from '../../src/execute/StageExecutionStatus';
import { StageExecution } from '../../src/execute/StageExecution';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';

const baseContext = createBuildContext();
const mockStage: Stage = {
	name: 'Mock Stage',
	execute: () => taskEither.right(baseContext),
	shouldStageExecute: vi.fn()
};

type MockShouldStageExecute = MockedFunction<predicate.Predicate<BuildContext>>;

describe('stageExecutionUtils', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('createStageExecution', () => {
		const execution = createStageExecution(mockStage);
		expect(execution).toEqual({
			stage: mockStage,
			status: StageExecutionStatus.Proceed
		});
	});

	describe('shouldStageExecute', () => {
		const execution: StageExecution = {
			status: StageExecutionStatus.Proceed,
			stage: mockStage
		};
		it('stage shouldStageExecute returns true', async () => {
			(
				mockStage.shouldStageExecute as MockShouldStageExecute
			).mockImplementation(() => true);
			const result = shouldStageExecute(baseContext)(execution);
			expect(result).toEqual(execution);
		});

		it('stage shouldStageExecute returns false', async () => {
			(
				mockStage.shouldStageExecute as MockShouldStageExecute
			).mockImplementation(() => false);
			const result = shouldStageExecute(baseContext)(execution);
			expect(result).toEqual({
				...execution,
				status: StageExecutionStatus.Skip
			});
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

		it('status is Skip', async () => {
			const execution: StageExecution = {
				stage: mockStage,
				status: StageExecutionStatus.Skip
			};

			const result = await executeIfAllowed(inputContext)(execution)();
			expect(result).toEqualRight(inputContext);
		});
	});
});
