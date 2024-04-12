import { beforeEach, expect, test, vi } from 'vitest';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { ProjectType } from '../../src/context/ProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';

import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { VersionType } from '../../src/context/VersionType';
import '../testutils/readGradleProjectMock';
import { RepoType } from '../../src/context/ProjectInfo';
import { match } from 'ts-pattern';

const baseBuildContext = createBuildContext();

beforeEach(() => {
	vi.resetAllMocks();
});

type GetProjectIfoArgs = Readonly<{
	versionType: VersionType;
	repoType: RepoType;
}>;

type VersionTypeValues = Readonly<{
	workingDir: string;
	version: string;
}>;

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'NPM getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<VersionType, VersionTypeValues>(
			versionType
		)
			.with(VersionType.Release, () => ({
				workingDir: 'npmReleaseLibrary',
				version: '1.0.0'
			}))
			.with(VersionType.PreRelease, () => ({
				workingDir: 'npmBetaLibrary',
				version: '1.0.0-beta'
			}))
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.NpmLibrary
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'craigmiller160',
				name: 'craig-build',
				version,
				versionType,
				npmBuildTool: 'yarn',
				repoType
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	}
);

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'Maven getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<VersionType, VersionTypeValues>(
			versionType
		)
			.with(VersionType.Release, () => ({
				workingDir: 'mavenReleaseLibrary',
				version: '1.2.0'
			}))
			.with(VersionType.PreRelease, () => ({
				workingDir: 'mavenSnapshotLibrary',
				version: '1.2.0-SNAPSHOT'
			}))
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenLibrary
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'io.craigmiller160',
				name: 'email-service',
				version,
				versionType,
				repoType
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	}
);

test('Maven getProjectInfo for monorepo application', () => {
	throw new Error();
});

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'Docker getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<VersionType, VersionTypeValues>(
			versionType
		)
			.with(VersionType.Release, () => ({
				workingDir: 'dockerReleaseImage',
				version: '1.0.0'
			}))
			.with(VersionType.PreRelease, () => ({
				workingDir: 'dockerBetaImage',
				version: '1.0.0-beta'
			}))
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.DockerImage
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'craigmiller160',
				name: 'nginx-base',
				version,
				versionType,
				repoType
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	}
);

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'Gradle getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<VersionType, VersionTypeValues>(
			versionType
		)
			.with(VersionType.Release, () => ({
				workingDir: 'gradleKotlinReleaseLibrary',
				version: '1.0.0'
			}))
			.with(VersionType.PreRelease, () => ({
				workingDir: 'gradleKotlinPreReleaseLibrary',
				version: '1.0.0-SNAPSHOT'
			}))
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleLibrary
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'io.craigmiller160',
				name: 'spring-gradle-playground',
				version,
				versionType,
				repoType
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	}
);

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'Helm Library getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<VersionType, VersionTypeValues>(
			versionType
		)
			.with(VersionType.Release, () => ({
				workingDir: 'helmReleaseLibrary',
				version: '1.0.0'
			}))
			.with(VersionType.PreRelease, () => ({
				workingDir: 'helmPreReleaseLibrary',
				version: '1.0.0-beta'
			}))
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);

		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmLibrary
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'craigmiller160',
				name: 'my-lib',
				version,
				versionType,
				repoType
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		if (VersionType.Release === versionType) {
			expect(result).toEqualRight(expectedContext);
		} else {
			expect(result).toEqualLeft(
				new Error(
					'Helm pre-release projects are not currently supported'
				)
			);
		}
	}
);

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'Helm Application getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<VersionType, VersionTypeValues>(
			versionType
		)
			.with(VersionType.Release, () => ({
				workingDir: 'helmReleaseApplication',
				version: '1.0.0'
			}))
			.with(VersionType.PreRelease, () => ({
				workingDir: 'helmPreReleaseApplication',
				version: '1.0.0-beta'
			}))
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'craigmiller160',
				name: 'my-app',
				version,
				versionType,
				repoType
			}
		};

		const result = await getProjectInfo.execute(buildContext)();
		if (VersionType.Release === versionType) {
			expect(result).toEqualRight(expectedContext);
		} else {
			expect(result).toEqualLeft(
				new Error(
					'Helm pre-release projects are not currently supported'
				)
			);
		}
	}
);
