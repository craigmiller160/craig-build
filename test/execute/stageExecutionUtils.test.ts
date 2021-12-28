import { createBuildContext } from '../testutils/createBuildContext';
import { Stage } from '../../src/stages/Stage';
import * as TE from 'fp-ts/TaskEither';
import { createStageExecution } from '../../src/execute/stageExecutionUtils';
import { StageExecutionStatus } from '../../src/execute/StageExecutionStatus';

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
			throw new Error();
		});

		it('status is Proceed and commandAllowsStage returns false', () => {
			throw new Error();
		});

		it('status is SkipForProject', () => {
			throw new Error();
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
