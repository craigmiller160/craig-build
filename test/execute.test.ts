import { execute } from '../src/execute';
import { BuildContext } from '../src/context/BuildContext';
import {
	createBuildContext,
	createIncompleteBuildContext
} from './testutils/createBuildContext';
import { STAGES, EARLY_STAGES } from '../src/stages';
import * as TE from 'fp-ts/TaskEither';
import { BaseStageFunction } from '../src/stages/Stage';
import '@relmify/jest-fp-ts';
import { Context } from '../src/context/Context';

jest.mock('../src/stages', () => ({
	EARLY_STAGES: [
		{
			name: 'Stage1',
			execute: jest.fn()
		},
		{
			name: 'Stage2',
			execute: jest.fn()
		},
		{
			name: 'Stage3',
			execute: jest.fn()
		}
	],
	STAGES: [
		{
			name: 'Stage4',
			execute: jest.fn()
		},
		{
			name: 'Stage5',
			execute: jest.fn()
		},
		{
			name: 'Stage6',
			execute: jest.fn()
		}
	]
}));

const incompleteBuildContext = createIncompleteBuildContext();
const buildContext: BuildContext = createBuildContext();

const mockStageFn = <Ctx extends Context>(
	fn: BaseStageFunction<Ctx>,
	result: TE.TaskEither<Error, Context>
) => (fn as jest.Mock).mockImplementation(() => result);

describe('execute', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes all early and main stages successfully', async () => {
		mockStageFn(EARLY_STAGES[0].execute, TE.right(incompleteBuildContext));
		mockStageFn(EARLY_STAGES[1].execute, TE.right(incompleteBuildContext));
		mockStageFn(EARLY_STAGES[2].execute, TE.right(incompleteBuildContext));

		mockStageFn(STAGES[0].execute, TE.right(buildContext));
		mockStageFn(STAGES[1].execute, TE.right(buildContext));
		mockStageFn(STAGES[2].execute, TE.right(buildContext));

		const result = await execute(incompleteBuildContext)();
		expect(result).toEqualRight(buildContext);

		expect(EARLY_STAGES[0].execute).toHaveBeenCalled();
		expect(EARLY_STAGES[1].execute).toHaveBeenCalled();
		expect(EARLY_STAGES[2].execute).toHaveBeenCalled();
		expect(STAGES[0].execute).toHaveBeenCalled();
		expect(STAGES[1].execute).toHaveBeenCalled();
		expect(STAGES[2].execute).toHaveBeenCalled();
	});

	it('aborts execution after early stage error', async () => {
		const error = new Error('Dying');
		mockStageFn(EARLY_STAGES[0].execute, TE.right(incompleteBuildContext));
		mockStageFn(EARLY_STAGES[1].execute, TE.left(error));
		mockStageFn(EARLY_STAGES[2].execute, TE.right(incompleteBuildContext));

		mockStageFn(STAGES[0].execute, TE.right(buildContext));
		mockStageFn(STAGES[1].execute, TE.right(buildContext));
		mockStageFn(STAGES[2].execute, TE.right(buildContext));

		const result = await execute(incompleteBuildContext)();
		expect(result).toEqualLeft(error);

		expect(EARLY_STAGES[0].execute).toHaveBeenCalled();
		expect(EARLY_STAGES[1].execute).toHaveBeenCalled();
		expect(EARLY_STAGES[2].execute).not.toHaveBeenCalled();
		expect(STAGES[0].execute).not.toHaveBeenCalled();
		expect(STAGES[1].execute).not.toHaveBeenCalled();
		expect(STAGES[2].execute).not.toHaveBeenCalled();
	});

	it('aborts execution after main stage error', async () => {
		const error = new Error('Dying');
		mockStageFn(EARLY_STAGES[0].execute, TE.right(incompleteBuildContext));
		mockStageFn(EARLY_STAGES[1].execute, TE.right(incompleteBuildContext));
		mockStageFn(EARLY_STAGES[2].execute, TE.right(incompleteBuildContext));

		mockStageFn(STAGES[0].execute, TE.right(buildContext));
		mockStageFn(STAGES[1].execute, TE.left(error));
		mockStageFn(STAGES[2].execute, TE.right(buildContext));

		const result = await execute(incompleteBuildContext)();
		expect(result).toEqualLeft(error);

		expect(EARLY_STAGES[0].execute).toHaveBeenCalled();
		expect(EARLY_STAGES[1].execute).toHaveBeenCalled();
		expect(EARLY_STAGES[2].execute).toHaveBeenCalled();
		expect(STAGES[0].execute).toHaveBeenCalled();
		expect(STAGES[1].execute).toHaveBeenCalled();
		expect(STAGES[2].execute).not.toHaveBeenCalled();
	});
});
