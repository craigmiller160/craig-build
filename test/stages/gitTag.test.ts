import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { gitTag } from '../../src/stages/gitTag';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';

const baseBuildContext = createBuildContext();

describe('gitTag', () => {
	it('skips for pre-release project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: true
			}
		};

		const result = gitTag.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).not.toHaveBeenCalled();
	});

	it('creates and pushes tag for release project', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: false,
				version: '1.0.0'
			}
		};

		const result = await gitTag.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'git tag v1.0.0');
		expect(runCommandMock).toHaveBeenNthCalledWith(2, 'git push --tags');
	});
});
