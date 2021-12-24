import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { validateGitTag } from '../../src/stages/validateGitTag';

const baseBuildContext = createBuildContext();

describe('validateGitTag', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips pre-release project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: true
			}
		};

		const result = await validateGitTag.execute(buildContext)();
		expect(result).toEqual(buildContext);
	});

	it('confirms there is no existing tag for release version', async () => {
		throw new Error();
	});

	it('finds an existing tag for release version', async () => {
		throw new Error();
	});
});
