import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import '@relmify/jest-fp-ts';
import { preparePreReleaseVersion } from '../../src/stages/preparePreReleaseVersion';
import {
	searchForDockerBetas,
	searchForNpmBetas
} from '../../src/services/NexusRepoApi';
import {
	NexusSearchResult,
	NexusSearchResultItem
} from '../../src/services/NexusSearchResult';
import { ProjectType } from '../../src/context/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import path from 'path';
import { homedir } from 'os';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForNpmBetas: jest.fn(),
	searchForDockerBetas: jest.fn()
}));

jest.mock('os', () => ({
	homedir: jest.fn()
}));

const baseBuildContext = createBuildContext();

const searchForNpmBetasMock = searchForNpmBetas as jest.Mock;
const searchForDockerBetasMock = searchForDockerBetas as jest.Mock;
const homedirMock = homedir as jest.Mock;

const createItem = (version: string): NexusSearchResultItem => ({
	name: '',
	group: '',
	format: '',
	repository: '',
	version,
	id: '',
	assets: []
});

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
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for NPM project based on existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() => TE.right(nexusResult));

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.3'
			}
		});

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for NPM project with no existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.1.0-beta.2')]
		};
		searchForNpmBetasMock.mockImplementation(() => TE.right(nexusResult));

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.1'
			}
		});

		expect(searchForNpmBetasMock).toHaveBeenCalledWith(
			'craigmiller160',
			'my-project'
		);
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
	});

	it('looks up recently created maven pre-release version from .m2', async () => {
		homedirMock.mockImplementation(() =>
			path.join(baseWorkingDir, 'mavenPreReleaseInfoM2')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'io.craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.1.0-SNAPSHOT'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.1.0-20211225.003019-1'
			}
		});

		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(searchForDockerBetasMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for Docker project based on existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.0.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.3'
			}
		});

		expect(searchForDockerBetasMock).toHaveBeenCalledWith('my-project');
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
	});

	it('prepares pre-release version for Docker project with no existing version', async () => {
		const nexusResult: NexusSearchResult = {
			items: [createItem('1.1.0-beta.2')]
		};
		searchForDockerBetasMock.mockImplementation(() =>
			TE.right(nexusResult)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				group: 'craigmiller160',
				name: 'my-project',
				isPreRelease: true,
				version: '1.0.0-beta'
			}
		};

		const result = await preparePreReleaseVersion.execute(buildContext)();
		expect(result).toEqualRight({
			...buildContext,
			projectInfo: {
				...buildContext.projectInfo,
				version: '1.0.0-beta.1'
			}
		});

		expect(searchForDockerBetasMock).toHaveBeenCalledWith('my-project');
		expect(searchForNpmBetasMock).not.toHaveBeenCalled();
		expect(homedirMock).not.toHaveBeenCalled();
	});
});
