import { ProjectType } from '../../src/context/ProjectType';
import {
	isApplication,
	isDocker,
	isMaven,
	isNpm
} from '../../src/context/projectTypeUtils';

const projectTypes = Object.values(ProjectType);

const npmLibrary = (result: boolean[], value: boolean) =>
	expect(result[0]).toEqual(value);
const mavenLibrary = (result: boolean[], value: boolean) =>
	expect(result[1]).toEqual(value);
const npmApplication = (result: boolean[], value: boolean) =>
	expect(result[2]).toEqual(value);
const mavenApplication = (result: boolean[], value: boolean) =>
	expect(result[3]).toEqual(value);
const dockerApplication = (result: boolean[], value: boolean) =>
	expect(result[4]).toEqual(value);
const dockerImage = (result: boolean[], value: boolean) =>
	expect(result[5]).toEqual(value);

describe('projectTypeUtils', () => {
	it('isMaven', () => {
		const result = projectTypes.map(isMaven);
		expect(result).toHaveLength(6);
		npmLibrary(result, false);
		mavenLibrary(result, true);
		npmApplication(result, false);
		mavenApplication(result, true);
		dockerApplication(result, false);
		dockerImage(result, false);
	});

	it('isNpm', () => {
		const result = projectTypes.map(isNpm);
		expect(result).toHaveLength(6);
		npmLibrary(result, true);
		mavenLibrary(result, false);
		npmApplication(result, true);
		mavenApplication(result, false);
		dockerApplication(result, false);
		dockerImage(result, false);
	});

	it('isDocker', () => {
		const result = projectTypes.map(isDocker);
		expect(result).toHaveLength(6);
		npmLibrary(result, false);
		mavenLibrary(result, false);
		npmApplication(result, false);
		mavenApplication(result, false);
		dockerApplication(result, true);
		dockerImage(result, true);
	});

	it('isApplication', () => {
		const result = projectTypes.map(isApplication);
		expect(result).toHaveLength(6);
		npmLibrary(result, false);
		mavenLibrary(result, false);
		npmApplication(result, true);
		mavenApplication(result, true);
		dockerApplication(result, true);
		dockerImage(result, false);
	});
});
