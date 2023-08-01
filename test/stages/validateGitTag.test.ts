import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { validateGitTag } from '../../src/stages/validateGitTag';
import { task, taskEither } from 'fp-ts';
import '@relmify/jest-fp-ts';
import { VersionType } from '../../src/context/VersionType';
import { readUserInput } from '../../src/utils/readUserInput';

const baseBuildContext = createBuildContext();
const versions = 'v0.0.1\nv0.1.1';

jest.mock('../../src/utils/readUserInput', () => ({
	readUserInput: jest.fn()
}));
const readUserInputMock = readUserInput as jest.Mock;

describe('validateGitTag', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('confirms there is no existing tag for release version', async () => {
		runCommandMock.mockImplementation(() => taskEither.right(versions));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release,
				version: '1.0.0'
			}
		};

		const result = await validateGitTag.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledWith('git tag');
		expect(readUserInputMock).not.toHaveBeenCalled();
	});

	it('finds an existing tag for release version, user allows bypass', async () => {
		runCommandMock.mockImplementation(() => taskEither.right(versions));
		readUserInputMock.mockImplementation(() => task.of('n'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release,
				version: '1.0.0'
			}
		};

		const result = await validateGitTag.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			doGitTag: false
		});

		expect(readUserInputMock).toHaveBeenCalledWith(
			'A git tag with version 0.1.1 already exists. Do you want to proceed and skip tagging? (y/n): '
		);
		expect(runCommandMock).toHaveBeenCalledWith('git tag');
	});

	it('finds an existing tag for release version, user does not allow bypass', async () => {
		runCommandMock.mockImplementation(() => taskEither.right(versions));
		readUserInputMock.mockImplementation(() => task.of('n'));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release,
				version: '0.1.1'
			}
		};

		const result = await validateGitTag.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Git tag for project release version already exists')
		);

		expect(readUserInputMock).toHaveBeenCalledWith(
			'A git tag with version 0.1.1 already exists. Do you want to proceed and skip tagging? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledWith('git tag');
	});

	it('skips execution for pre-release version', () => {
		runCommandMock.mockImplementation(() => taskEither.right(versions));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.PreRelease,
				version: '1.0.0-beta'
			}
		};

		const result = validateGitTag.shouldStageExecute(buildContext);
		expect(result).toEqual(false);
	});
});
