import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { gitTag } from '../../src/stages/gitTag';
import '@relmify/jest-fp-ts';

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
		throw new Error();
	});
});
