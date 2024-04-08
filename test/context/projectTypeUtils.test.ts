import { describe, expect, it } from 'vitest';
import { ProjectType } from '../../src/context/ProjectType';
import {
	isApplication,
	isDocker,
	isGradle,
	isHelm,
	isJvm,
	isMaven,
	isNpm
} from '../../src/context/projectTypeUtils';

const projectTypes = Object.values(ProjectType);
const NUM_PROJECT_TYPES = 11;

const npmLibrary = (result: boolean[], value: boolean) =>
	expect(result[0]).toEqual(value);
const mavenLibrary = (result: boolean[], value: boolean) =>
	expect(result[1]).toEqual(value);
const gradleLibrary = (result: boolean[], value: boolean) =>
	expect(result[2]).toEqual(value);
const gradleApplication = (result: boolean[], value: boolean) =>
	expect(result[3]).toEqual(value);
const npmApplication = (result: boolean[], value: boolean) =>
	expect(result[4]).toEqual(value);
const mavenApplication = (result: boolean[], value: boolean) =>
	expect(result[5]).toEqual(value);
const dockerApplication = (result: boolean[], value: boolean) =>
	expect(result[6]).toEqual(value);
const dockerImage = (result: boolean[], value: boolean) =>
	expect(result[7]).toEqual(value);
const helmApplication = (result: boolean[], value: boolean) =>
	expect(result[8]).toEqual(value);
const helmLibrary = (result: boolean[], value: boolean) =>
	expect(result[9]).toEqual(value);
const unknownType = (result: boolean[], value: boolean) =>
	expect(result[10]).toEqual(value);

describe('projectTypeUtils', () => {
	it('isMaven', () => {
		const result = projectTypes.map(isMaven);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, false);
		mavenLibrary(result, true);
		gradleLibrary(result, false);
		gradleApplication(result, false);
		npmApplication(result, false);
		mavenApplication(result, true);
		dockerApplication(result, false);
		dockerImage(result, false);
		helmApplication(result, false);
		helmLibrary(result, false);
		unknownType(result, false);
	});

	it('isNpm', () => {
		const result = projectTypes.map(isNpm);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, true);
		mavenLibrary(result, false);
		gradleLibrary(result, false);
		gradleApplication(result, false);
		npmApplication(result, true);
		mavenApplication(result, false);
		dockerApplication(result, false);
		dockerImage(result, false);
		helmApplication(result, false);
		helmLibrary(result, false);
		unknownType(result, false);
	});

	it('isDocker', () => {
		const result = projectTypes.map(isDocker);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, false);
		mavenLibrary(result, false);
		gradleLibrary(result, false);
		gradleApplication(result, false);
		npmApplication(result, false);
		mavenApplication(result, false);
		dockerApplication(result, true);
		dockerImage(result, true);
		helmApplication(result, false);
		helmLibrary(result, false);
		unknownType(result, false);
	});

	it('isHelm', () => {
		const result = projectTypes.map(isHelm);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, false);
		mavenLibrary(result, false);
		gradleLibrary(result, false);
		gradleApplication(result, false);
		npmApplication(result, false);
		mavenApplication(result, false);
		dockerApplication(result, false);
		dockerImage(result, false);
		helmApplication(result, true);
		helmLibrary(result, true);
		unknownType(result, false);
	});

	it('isApplication', () => {
		const result = projectTypes.map(isApplication);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, false);
		gradleLibrary(result, false);
		gradleApplication(result, true);
		mavenLibrary(result, false);
		npmApplication(result, true);
		mavenApplication(result, true);
		dockerApplication(result, true);
		dockerImage(result, false);
		helmApplication(result, true);
		helmLibrary(result, false);
		unknownType(result, false);
	});

	it('isGradle', () => {
		const result = projectTypes.map(isGradle);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, false);
		gradleLibrary(result, true);
		gradleApplication(result, true);
		mavenLibrary(result, false);
		npmApplication(result, false);
		mavenApplication(result, false);
		dockerApplication(result, false);
		dockerImage(result, false);
		helmApplication(result, false);
		helmLibrary(result, false);
		unknownType(result, false);
	});

	it('isJvm', () => {
		const result = projectTypes.map(isJvm);
		expect(result).toHaveLength(NUM_PROJECT_TYPES);
		npmLibrary(result, false);
		gradleLibrary(result, true);
		gradleApplication(result, true);
		mavenLibrary(result, true);
		npmApplication(result, false);
		mavenApplication(result, true);
		dockerApplication(result, false);
		dockerImage(result, false);
		helmApplication(result, false);
		helmLibrary(result, false);
		unknownType(result, false);
	});
});
