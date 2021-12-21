import identifyProject, {
	TASK_NAME
} from '../../../../old-src/stages/identify/tasks/identifyProject';
import Mock = jest.Mock;
import getCwd from '../../../../old-src/utils/getCwd';
import path from 'path';
import ProjectType from '../../../../old-src/types/ProjectType';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../old-src/error/BuildError';

const getCwdMock: Mock = getCwd as Mock;

describe('identifyProject task', () => {
	it('is NpmApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				process.cwd(),
				'test',
				'__working-dirs__',
				'npmReleaseApplication'
			)
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualRight(ProjectType.NpmApplication);
	});

	it('is NpmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				process.cwd(),
				'test',
				'__working-dirs__',
				'npmReleaseLibrary'
			)
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualRight(ProjectType.NpmLibrary);
	});

	it('is MavenApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				process.cwd(),
				'test',
				'__working-dirs__',
				'mavenReleaseApplication'
			)
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualRight(ProjectType.MavenApplication);
	});

	it('is MavenLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				process.cwd(),
				'test',
				'__working-dirs__',
				'mavenReleaseLibrary'
			)
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualRight(ProjectType.MavenLibrary);
	});

	it('is DockerImage', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				process.cwd(),
				'test',
				'__working-dirs__',
				'dockerReleaseImage'
			)
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualRight(ProjectType.DockerImage);
	});

	it('is DockerApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				process.cwd(),
				'test',
				'__working-dirs__',
				'dockerReleaseApplication'
			)
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualRight(ProjectType.DockerApplication);
	});

	it('is unknown project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(process.cwd(), 'test', '__working-dirs__')
		);
		const result = await identifyProject(undefined)();
		expect(result).toEqualLeft(
			new BuildError('Unable to identify project type', TASK_NAME)
		);
	});
});
