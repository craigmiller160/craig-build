import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { getProjectType } from '../../src/stages/getProjectType';
import { ProjectType } from '../../src/context/ProjectType';

import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';

const buildContext = createBuildContext();

describe('getProjectType', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('is GradleLibrary (Kotlin)', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleKotlinReleaseLibrary')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.GradleLibrary
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is GradleLibrary (Groovy)', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleGroovyReleaseLibrary')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.GradleLibrary
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is GradleApplication (Kotlin)', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleKotlinReleaseApplication')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.GradleApplication
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is GradleApplication (Groovy)', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleGroovyReleaseApplication')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.GradleApplication
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is NpmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseLibrary')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.NpmLibrary
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
			projectType: ProjectType.MavenLibrary
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
			projectType: ProjectType.NpmApplication
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
			projectType: ProjectType.MavenApplication
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
			projectType: ProjectType.DockerApplication
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
			projectType: ProjectType.DockerImage
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('is HelmLibrary', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'helmReleaseLibrary')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.HelmLibrary
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('isHelmApplication', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'helmReleaseApplication')
		);
		const expectedContext: BuildContext = {
			...buildContext,
			projectType: ProjectType.HelmApplication
		};
		const result = await getProjectType.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});
});
