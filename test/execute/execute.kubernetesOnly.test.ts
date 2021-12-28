import { createBuildContext } from '../testutils/createBuildContext';
import { Stage } from '../../src/stages/Stage';
import { BuildContext } from '../../src/context/BuildContext';
import { stages } from '../../src/stages';
import * as TE from 'fp-ts/TaskEither';
import { ExpectedExecution } from '../expectedExecutions/ExpectedExecution';

jest.mock('../../src/stages', () => {
	const createStageMock = (stage: Stage): Stage => ({
		name: stage.name,
		execute: jest.fn(),
		commandAllowsStage: stage.commandAllowsStage,
		projectAllowsStage: stage.projectAllowsStage
	});

	const { stages } = jest.requireActual('../../src/stages');
	return {
		stages: stages.map(createStageMock)
	};
});

const prepareStageExecutionMock = (context: BuildContext) => {
	stages.forEach((stage) => {
		(stage.execute as jest.Mock).mockImplementation(() =>
			TE.right(context)
		);
	});
};

const validateStages = (expected: ExpectedExecution) => {
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
			// eslint-disable-next-line no-console
			console.error('ERROR WITH STAGE', stage.name);
			throw ex;
		}
	});
};

const baseContext = createBuildContext();

describe('execute.kubernetesOnly', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	})

	it('executes kubernetes only for release MavenApplication', () => {
		throw new Error();
	});

	it('executes kubernetes only for pre-release MavenApplication', () => {
		throw new Error();
	});

	it('executes kubernetes only for release MavenLibrary', () => {
		throw new Error();
	});

	it('executes kubernetes only for pre-release MavenLibrary', () => {
		throw new Error();
	});

	it('executes kubernetes only for release NpmApplication', () => {
		throw new Error();
	});

	it('executes kubernetes only for pre-release NpmApplication', () => {
		throw new Error();
	});

	it('executes kubernetes only for release NpmLibrary', () => {
		throw new Error();
	});

	it('executes kubernetes only for pre-release NpmLibrary', () => {
		throw new Error();
	});

	it('executes kubernetes only for release DockerApplication', () => {
		throw new Error();
	});

	it('executes kubernetes only for pre-release DockerApplication', () => {
		throw new Error();
	});

	it('executes kubernetes only for release DockerImage', () => {
		throw new Error();
	});

	it('executes kubernetes only for pre-release DockerImage', () => {
		throw new Error();
	});
});
