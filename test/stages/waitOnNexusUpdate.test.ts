import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { wait } from '../../src/utils/wait';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { waitOnNexusUpdate } from '../../src/stages/waitOnNexusUpdate';

import { task } from 'fp-ts';

vi.mock('../../src/utils/wait', () => ({
	wait: vi.fn()
}));

const waitMock = wait as MockedFunction<typeof wait>;
const baseBuildContext = createBuildContext();

describe('waitOnNexusUpdate', () => {
	beforeEach(() => {
		vi.resetAllMocks();
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
