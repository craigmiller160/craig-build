import { OptionValues, program } from 'commander';
import { CommandType } from '../../src/context/CommandType';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import '@relmify/jest-fp-ts';
import { BuildContext } from '../../src/context/BuildContext';
import { createBuildContext } from '../testutils/createBuildContext';

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
		const buildContext: BuildContext = createBuildContext({
			commandInfo: {
				type: CommandType.Unknown
			}
		});
		const result = await getCommandInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			commandInfo: {
				type: CommandType.FullBuild
			}
		});
	});

	it('DOCKER_ONLY', async () => {
		const options: OptionValues = {
			dockerOnly: true
		};
		optsMock.mockImplementation(() => options);
		const buildContext: BuildContext = createBuildContext({
			commandInfo: {
				type: CommandType.Unknown
			}
		});
		const result = await getCommandInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			commandInfo: {
				type: CommandType.DockerOnly
			}
		});
	});

	it('KUBERNETES_ONLY', async () => {
		const options: OptionValues = {
			kubernetesOnly: true
		};
		optsMock.mockImplementation(() => options);
		const buildContext: BuildContext = createBuildContext({
			commandInfo: {
				type: CommandType.Unknown
			}
		});
		const result = await getCommandInfo.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			commandInfo: {
				type: CommandType.KubernetesOnly
			}
		});
	});
});
