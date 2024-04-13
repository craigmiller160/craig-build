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
import { ProjectInfo, RepoType } from '../../src/context/ProjectInfo';
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
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' }
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
		if (repoType === 'polyrepo') {
			expect(result).toEqualRight(expectedContext);
		} else {
			expect(result).toEqualLeft(
				new Error('Monorepo not supported for this project type')
			);
		}
	}
);

type VersionAndRepoType = Readonly<{
	versionType: VersionType;
	repoType: RepoType;
}>;

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monorepo' }
])(
	'Maven getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const { workingDir, version } = match<
			VersionAndRepoType,
			VersionTypeValues
		>({ versionType, repoType })
			.with(
				{ versionType: VersionType.Release, repoType: 'polyrepo' },
				() => ({
					workingDir: 'mavenReleaseLibrary',
					version: '1.2.0'
				})
			)
			.with(
				{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
				() => ({
					workingDir: 'mavenSnapshotLibrary',
					version: '1.2.0-SNAPSHOT'
				})
			)
			.with(
				{ versionType: VersionType.Release, repoType: 'monorepo' },
				() => ({
					workingDir: 'mavenReleaseLibraryMonorepo',
					version: '1.2.0'
				})
			)
			.run();

		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenLibrary
		};

		const monorepoChildren: ReadonlyArray<ProjectInfo> = [
			{
				group: 'io.craigmiller160',
				name: 'email-service-child-1',
				version,
				versionType,
				repoType
			},
			{
				group: 'io.craigmiller160',
				name: 'email-service-child-2',
				version,
				versionType,
				repoType
			}
		];

		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: {
				group: 'io.craigmiller160',
				name: 'email-service',
				version,
				versionType,
				repoType,
				monorepoChildren:
					repoType === 'monorepo' ? monorepoChildren : undefined
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		if (repoType === 'polyrepo') {
			expect(result).toEqualRight(expectedContext);
		} else {
			expect(result).toEqualLeft(
				new Error('Monorepo not supported for this project type')
			);
		}
	}
);

test('Maven getProjectInfo for monorepo application', async () => {
	getCwdMock.mockImplementation(() =>
		path.resolve(baseWorkingDir, 'mavenReleaseApplicationMonorepo')
	);
	const buildContext: BuildContext = {
		...baseBuildContext,
		projectType: ProjectType.MavenApplication
	};
	const result = await getProjectInfo.execute(buildContext)();
	expect(result).toEqualLeft(
		new Error('Monorepo not supported for this project type')
	);
});

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' }
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
		if (repoType === 'polyrepo') {
			expect(result).toEqualRight(expectedContext);
		} else {
			expect(result).toEqualLeft(
				new Error('Monorepo not supported for this project type')
			);
		}
	}
);

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' }
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
		if (repoType === 'polyrepo') {
			expect(result).toEqualRight(expectedContext);
		} else {
			expect(result).toEqualLeft(
				new Error('Monorepo not supported for this project type')
			);
		}
	}
);

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' }
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
		if (repoType === 'monorepo') {
			expect(result).toEqualLeft(
				new Error('Monorepo not supported for this project type')
			);
		} else if (VersionType.Release === versionType) {
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
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' }
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
		if (repoType === 'monorepo') {
			expect(result).toEqualLeft(
				new Error('Monorepo not supported for this project type')
			);
		} else if (VersionType.Release === versionType) {
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
