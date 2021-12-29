import { createBuildContext } from '../testutils/createBuildContext';
import { Stage } from '../../src/stages/Stage';
import * as TE from 'fp-ts/TaskEither';
import {
	createStageExecution,
	executeIfAllowed,
	shouldStageExecute
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
	shouldStageExecute: jest.fn()
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

	describe('shouldStageExecute', () => {
		it('stage shouldStageExecute returns true', () => {
			throw new Error();
		});

		it('stage shouldStageExecute returns false', () => {
			throw new Error();
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
