import {
	isApplication,
	isDocker,
	isLibrary,
	isMaven,
	isNpm
} from '../../src/utils/projectTypeUtils';
import ProjectType from '../../src/types/ProjectType';

describe('projectTypeUtils', () => {
	it('isApplication', () => {
		expect(isApplication(ProjectType.MavenApplication)).toEqual(true);
		expect(isApplication(ProjectType.NpmApplication)).toEqual(true);
		expect(isApplication(ProjectType.MavenLibrary)).toEqual(false);
		expect(isApplication(ProjectType.NpmLibrary)).toEqual(false);
		expect(isApplication(ProjectType.DockerApplication)).toEqual(true);
		expect(isApplication(ProjectType.DockerImage)).toEqual(false);
	});

	it('isLibrary', () => {
		expect(isLibrary(ProjectType.MavenApplication)).toEqual(false);
		expect(isLibrary(ProjectType.NpmApplication)).toEqual(false);
		expect(isLibrary(ProjectType.MavenLibrary)).toEqual(true);
		expect(isLibrary(ProjectType.NpmLibrary)).toEqual(true);
		expect(isLibrary(ProjectType.DockerApplication)).toEqual(false);
		expect(isLibrary(ProjectType.DockerImage)).toEqual(false);
	});

	it('isMaven', () => {
		expect(isMaven(ProjectType.MavenApplication)).toEqual(true);
		expect(isMaven(ProjectType.NpmApplication)).toEqual(false);
		expect(isMaven(ProjectType.MavenLibrary)).toEqual(true);
		expect(isMaven(ProjectType.NpmLibrary)).toEqual(false);
		expect(isMaven(ProjectType.DockerApplication)).toEqual(false);
		expect(isMaven(ProjectType.DockerImage)).toEqual(false);
	});

	it('isNpm', () => {
		expect(isNpm(ProjectType.MavenApplication)).toEqual(false);
		expect(isNpm(ProjectType.NpmApplication)).toEqual(true);
		expect(isNpm(ProjectType.MavenLibrary)).toEqual(false);
		expect(isNpm(ProjectType.NpmLibrary)).toEqual(true);
		expect(isNpm(ProjectType.DockerApplication)).toEqual(false);
		expect(isNpm(ProjectType.DockerImage)).toEqual(false);
	});

	it('isDocker', () => {
		expect(isDocker(ProjectType.MavenApplication)).toEqual(false);
		expect(isDocker(ProjectType.NpmApplication)).toEqual(false);
		expect(isDocker(ProjectType.MavenLibrary)).toEqual(false);
		expect(isDocker(ProjectType.NpmLibrary)).toEqual(false);
		expect(isDocker(ProjectType.DockerApplication)).toEqual(true);
		expect(isDocker(ProjectType.DockerImage)).toEqual(true);
	});
});
