import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import '@relmify/jest-fp-ts';
import { preparePreReleaseVersion } from '../../src/stages/preparePreReleaseVersion';
import { searchForNpmBetas } from '../../src/services/NexusRepoApi';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmBetas: jest.fn()
}));

const baseBuildContext = createBuildContext();

const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;

describe('preparePreReleaseVersion', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips for release project', async () => {
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectInfo: {
				...baseBuildContext.projectInfo,
				isPreRelease: false
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for NPM project', async () => {
		throw new Error();
	});

	it('prepares pre-release version for Maven project', async () => {
		throw new Error();
	});

	it('prepares pre-release version for Docker project', async () => {
		throw new Error();
	});
});
