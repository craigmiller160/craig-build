import {
	searchForDockerReleases,
	searchForMavenReleases,
	searchForNpmReleases
} from '../../src/services/NexusRepoApi';
import '@relmify/jest-fp-ts';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import ProjectType from '../../old-src/types/ProjectType';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { validateProjectVersionAllowed } from '../../src/stages/validateProjectVersionAllowed';
import {
	NexusSearchResult,
	NexusSearchResultItem
} from '../../src/services/NexusSearchResult';

jest.mock('../../src/services/NexusRepoApi', () => ({
	searchForDockerReleases: jest.fn(),
	searchForMavenReleases: jest.fn(),
	searchForNpmReleases: jest.fn()
}));

const searchForDockerReleasesMock = searchForDockerReleases as jest.Mock;
const searchForMavenReleasesMock = searchForMavenReleases as jest.Mock;
const searchForNpmReleasesMock = searchForNpmReleases as jest.Mock;

const baseBuildContext = createBuildContext();

const invalidItem: NexusSearchResultItem = {
	id: '',
	repository: '',
	format: '',
	group: '',
	name: '',
	version: '10.0.0',
	assets: []
};

describe('validateProjectVersionAllowed', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('allows npm pre-release version', async () => {
		searchForNpmReleasesMock.mockImplementation(() => E.left(new Error()));
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: true
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows maven pre-release version', async () => {
		searchForMavenReleasesMock.mockImplementation(() =>
			E.left(new Error())
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.MavenApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: true
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows docker pre-release version', async () => {
		searchForDockerReleasesMock.mockImplementation(() =>
			E.left(new Error())
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.DockerApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: true
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows npm release version with no conflicts', async () => {
		searchForNpmReleasesMock.mockImplementation(
			(): NexusSearchResult => ({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: false
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows maven release version with no conflicts', async () => {
		searchForMavenReleasesMock.mockImplementation(
			(): NexusSearchResult => ({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.MavenApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: false
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);
	});

	it('allows docker release version with no conflicts', async () => {
		searchForDockerReleasesMock.mockImplementation(
			(): NexusSearchResult => ({ items: [] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.DockerApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: false
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualRight(buildContext);
	});

	it('rejects npm release version with conflict', async () => {
		searchForNpmReleasesMock.mockImplementation(
			(): NexusSearchResult => ({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: false
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualLeft(new Error());
	});

	it('rejects maven release version with conflicts', async () => {
		searchForMavenReleasesMock.mockImplementation(
			(): NexusSearchResult => ({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.MavenApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: false
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualLeft(new Error());
	});

	it('rejects docker release version with conflicts', async () => {
		searchForDockerReleasesMock.mockImplementation(
			(): NexusSearchResult => ({ items: [invalidItem] })
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.DockerApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: false
				}))
			)
		};

		const result = await validateProjectVersionAllowed.execute(
			buildContext
		)();
		expect(result).toEqualLeft(new Error());
	});
});
