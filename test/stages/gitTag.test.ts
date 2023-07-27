import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { gitTag } from '../../src/stages/gitTag';
import '@relmify/jest-fp-ts';
import { taskEither } from 'fp-ts';
import { VersionType } from '../../src/context/VersionType';

const baseBuildContext = createBuildContext();

describe('gitTag', () => {
	it('creates and pushes tag for release project', async () => {
		runCommandMock.mockImplementation(() => TE.right(''));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release,
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
