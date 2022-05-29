import '@relmify/jest-fp-ts';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { VersionType } from '../../src/context/VersionType';

const baseBuildContext = createBuildContext();

describe('validateDependencyVersions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('all release dependencies are valid for maven project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('all release dependencies are valid for gradle kotlin project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleKotlinReleaseApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleKotlinApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('all release dependencies are valid for npm project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('invalid release dependencies for maven project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplicationBadDependency')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot have SNAPSHOT dependencies in Maven release')
		);
	});

	it('invalid release dependencies for gradle kotlin project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'gradleKotlinReleaseApplicationBadDependency'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleKotlinApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot have SNAPSHOT dependencies in Gradle release')
		);
	});

	it('invalid release dependencies for npm project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseApplicationBadDependency')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Cannot have beta dependencies in NPM release')
		);
	});
});
