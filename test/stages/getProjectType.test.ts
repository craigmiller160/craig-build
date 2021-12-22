import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { getProjectType } from '../../src/stages/getProjectType';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import ProjectType from '../../old-src/types/ProjectType';
import * as O from 'fp-ts/Option';
import '@relmify/jest-fp-ts';

const baseWorkingDirPath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__'
);

const buildContext = createBuildContext();

describe('getProjectType', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('is NpmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'npmReleaseLibrary')
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
			path.resolve(baseWorkingDirPath, 'mavenReleaseLibrary')
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
			path.resolve(baseWorkingDirPath, 'npmReleaseApplication')
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
			path.resolve(baseWorkingDirPath, 'mavenReleaseApplication')
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
			path.resolve(baseWorkingDirPath, 'dockerReleaseApplication')
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
			path.resolve(baseWorkingDirPath, 'dockerReleaseImage')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: O.some(ProjectType.DockerImage)
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});
});
