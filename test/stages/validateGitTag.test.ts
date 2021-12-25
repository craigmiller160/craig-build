import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { validateGitTag } from '../../src/stages/validateGitTag';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';

const baseBuildContext = createBuildContext();
const versions = 'v0.0.1\nv0.1.1';

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
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('confirms there is no existing tag for release version', async () => {
		runCommandMock.mockImplementation(() => TE.right(versions));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: false,
				version: '1.0.0'
			}
		};

		const result = await validateGitTag.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith('git tag');
	});

	it('finds an existing tag for release version', async () => {
		runCommandMock.mockImplementation(() => TE.right(versions));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: false,
				version: '0.1.1'
			}
		};

		const result = await validateGitTag.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Git tag for project release version already exists')
		);

		expect(runCommandMock).toHaveBeenCalledWith('git tag');
	});
});
