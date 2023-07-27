import { wait } from '../../src/utils/wait';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { waitOnNexusUpdate } from '../../src/stages/waitOnNexusUpdate';
import '@relmify/jest-fp-ts';
import { task } from 'fp-ts';

jest.mock('../../src/utils/wait', () => ({
	wait: jest.fn()
}));

const waitMock = wait as jest.Mock;
const baseBuildContext = createBuildContext();

describe('waitOnNexusUpdate', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('waits on non-docker application', async () => {
		waitMock.mockImplementation(() => task.of(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication
		};

		const result = await waitOnNexusUpdate.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(waitMock).toHaveBeenCalledWith(3000);
	});
});
