import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { OptionValues, program } from 'commander';
import { CommandType } from '../../src/context/CommandType';
import { getCommandInfo } from '../../src/stages/getCommandInfo';
import '@relmify/jest-fp-ts';
import { BuildContext } from '../../src/context/BuildContext';
import { createBuildContext } from '../testutils/createBuildContext';

vi.mock('commander', async () => {
	const { OptionValues } = await vi.importActual<{
		OptionValues: OptionValues;
	}>('commander');
	return {
		OptionValues,
		program: {
			opts: vi.fn()
		}
	};
});

const optsMock = program.opts as MockedFunction<typeof program.opts>;

describe('getCommandInfo', () => {
	beforeEach(() => {
		vi.resetAllMocks();
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

	it('TERRAFORM_ONLY', async () => {
		const options: OptionValues = {
			terraformOnly: true
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
				type: CommandType.TerraformOnly
			}
		});
	});
});
