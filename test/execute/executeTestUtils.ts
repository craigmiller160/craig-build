import { Stage } from '../../src/stages/Stage';
import { BuildContext } from '../../src/context/BuildContext';
import { stages } from '../../src/stages';
import { taskEither } from 'fp-ts';
import { ExpectedExecution } from '../expectedExecutions/ExpectedExecution';

vi.mock('../../src/stages', () => {
	const createStageMock = (stage: Stage): Stage => ({
		name: stage.name,
		execute: vi.fn(),
		shouldStageExecute: stage.shouldStageExecute
	});

	const { stages } = vi.requireActual('../../src/stages');
	return {
		stages: stages.map(createStageMock)
	};
});

export const prepareStageExecutionMock = (context: BuildContext) => {
	stages.forEach((stage) => {
		(stage.execute as vi.Mock).mockImplementation(() =>
			taskEither.right(context)
		);
	});
};

export const validateStages = (expected: ExpectedExecution) => {
	expect(Object.keys(expected)).toHaveLength(stages.length);
	stages.forEach((stage) => {
		try {
			const expectedValue = expected[stage.name];
			expect(expectedValue).not.toBeUndefined();
			if (expectedValue) {
				expect(stage.execute).toHaveBeenCalled();
			} else {
				expect(stage.execute).not.toHaveBeenCalled();
			}
		} catch (ex) {
			throw new Error(
				`Error validating stage: ${stage.name}.\n${
					(ex as Error).message
				}`,
				{
					cause: ex
				}
			);
		}
	});
};
