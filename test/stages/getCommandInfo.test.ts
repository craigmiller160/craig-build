import { OptionValues, program } from 'commander';
import { CommandType } from '../../src/context/CommandType';
import * as O from 'fp-ts/Option';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import '@relmify/jest-fp-ts';
import { createIncompleteBuildContext } from '../testutils/createBuildContext';
import { IncompleteBuildContext } from '../../src/context/IncompleteBuildContext';

jest.mock('commander', () => {
	const { OptionValues } = jest.requireActual('commander');
	return {
		OptionValues,
		program: {
			opts: jest.fn()
		}
	};
});

const optsMock = program.opts as jest.Mock;

describe('getCommandInfo', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('FULL_BUILD', async () => {
		const options: OptionValues = {
			fullBuild: true
		};
		optsMock.mockImplementation(() => options);
		const buildContext: IncompleteBuildContext =
			createIncompleteBuildContext({
				commandInfo: O.none
			});
		const result = await getCommandInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			commandInfo: O.some({
				type: CommandType.FullBuild
			})
		});
	});

	it('DOCKER_ONLY', async () => {
		const options: OptionValues = {
			dockerOnly: true
		};
		optsMock.mockImplementation(() => options);
		const buildContext: IncompleteBuildContext =
			createIncompleteBuildContext({
				commandInfo: O.none
			});
		const result = await getCommandInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			commandInfo: O.some({
				type: CommandType.DockerOnly
			})
		});
	});

	it('KUBERNETES_ONLY', async () => {
		const options: OptionValues = {
			kubernetesOnly: true
		};
		optsMock.mockImplementation(() => options);
		const buildContext: IncompleteBuildContext =
			createIncompleteBuildContext({
				commandInfo: O.none
			});
		const result = await getCommandInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			commandInfo: O.some({
				type: CommandType.KubernetesOnly
			})
		});
	});
});
