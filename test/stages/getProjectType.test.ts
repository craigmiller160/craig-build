import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { getProjectType } from '../../src/stages/getProjectType';
import { createIncompleteBuildContext } from '../testutils/createBuildContext';
import ProjectType from '../../old-src/types/ProjectType';
import * as O from 'fp-ts/Option';
import '@relmify/jest-fp-ts';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { IncompleteBuildContext } from '../../src/context/IncompleteBuildContext';

const buildContext = createIncompleteBuildContext();

describe('getProjectType', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('is NpmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseLibrary')
		);
		const expectedContext: IncompleteBuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.NpmLibrary)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is MavenLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseLibrary')
		);
		const expectedContext: IncompleteBuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.MavenLibrary)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is NpmApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseApplication')
		);
		const expectedContext: IncompleteBuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.NpmApplication)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is MavenApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplication')
		);
		const expectedContext: IncompleteBuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.MavenApplication)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is DockerApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'dockerReleaseApplication')
		);
		const expectedContext: IncompleteBuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.DockerApplication)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is DockerImage', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'dockerReleaseImage')
		);
		const expectedContext: IncompleteBuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.DockerImage)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});
});
