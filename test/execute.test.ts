import { execute } from '../src/execute';
import { BuildContext } from '../src/context/BuildContext';
import { createBuildContext } from './testutils/createBuildContext';
import { STAGES } from '../src/stages';
import * as TE from 'fp-ts/TaskEither';
import { StageFunction } from '../src/stages/Stage';
import '@relmify/jest-fp-ts';

jest.mock('../src/stages', () => {
	return {
		STAGES: [
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
		]
	};
});

const buildContext: BuildContext = createBuildContext();

const mockStageFn = (
	fn: StageFunction,
	result: TE.TaskEither<Error, BuildContext>
) => (fn as jest.Mock).mockImplementation(() => result);

describe('execute', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('executes all stages successfully', async () => {
		mockStageFn(STAGES[0].execute, TE.right(buildContext));
		mockStageFn(STAGES[1].execute, TE.right(buildContext));
		mockStageFn(STAGES[2].execute, TE.right(buildContext));

		const result = await execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(STAGES[0].execute).toHaveBeenCalled();
		expect(STAGES[1].execute).toHaveBeenCalled();
		expect(STAGES[2].execute).toHaveBeenCalled();
	});

	it('aborts execution after stage error', async () => {
		const error = new Error('Dying');
		mockStageFn(STAGES[0].execute, TE.right(buildContext));
		mockStageFn(STAGES[1].execute, TE.left(error));
		mockStageFn(STAGES[2].execute, TE.right(buildContext));

		const result = await execute(buildContext)();
		expect(result).toEqualLeft(error);

		expect(STAGES[0].execute).toHaveBeenCalled();
		expect(STAGES[1].execute).toHaveBeenCalled();
		expect(STAGES[2].execute).not.toHaveBeenCalled();
	});
});
