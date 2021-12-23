import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { getProjectType } from '../../src/stages/getProjectType';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import ProjectType from '../../old-src/types/ProjectType';
import * as O from 'fp-ts/Option';
import '@relmify/jest-fp-ts';
import { baseWorkingDir } from '../testutils/baseWorkingDir';

const buildContext = createBuildContext();

describe('getProjectType', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('is NpmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseLibrary')
		);
		const expectedContext: BuildContext = {
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
		const expectedContext: BuildContext = {
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
		const expectedContext: BuildContext = {
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
		const expectedContext: BuildContext = {
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
		const expectedContext: BuildContext = {
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
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.DockerImage)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});
});
