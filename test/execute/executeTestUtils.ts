import { Stage } from '../../src/stages/Stage';
import { BuildContext } from '../../src/context/BuildContext';
import { stages } from '../../src/stages';
import * as TE from 'fp-ts/TaskEither';

jest.mock('../../src/stages', () => {
	const createStageMock = (stage: Stage): Stage => ({
		name: stage.name,
		execute: jest.fn(),
		shouldStageExecute: stage.shouldStageExecute
	});

	const { stages } = jest.requireActual('../../src/stages');
	return {
		stages: stages.map(createStageMock)
	};
});

export const prepareStageExecutionMock = (context: BuildContext) => {
	stages.forEach((stage) => {
		(stage.execute as jest.Mock).mockImplementation(() =>
			TE.right(context)
		);
	});
};
