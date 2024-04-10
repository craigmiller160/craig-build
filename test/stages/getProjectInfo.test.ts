import { beforeEach, describe, expect, it, test, vi } from 'vitest';
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

test.each<GetProjectIfoArgs>([
	{ versionType: VersionType.Release, repoType: 'polyrepo' },
	{ versionType: VersionType.PreRelease, repoType: 'polyrepo' },
	{ versionType: VersionType.Release, repoType: 'monrepo' }
])(
	'NPM getProjectInfo for $versionType and $repoType',
	async ({ versionType, repoType }) => {
		const workingDir = match(versionType)
			.with(VersionType.Release, () => 'npmReleaseLibrary')
			.with(VersionType.PreRelease, () => 'npmPreReleaseLibrary')
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
				version: '1.0.0',
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
	({ versionType, repoType }) => {
		throw new Error();
	}
);

test('Maven getProjectInfo for monorepo application', () => {
	throw new Error();
});

describe('getProjectInfo', () => {
	it('NPM release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmReleaseLibrary')
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
				version: '1.0.0',
				versionType: VersionType.Release,
				npmBuildTool: 'yarn'
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('NPM pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmBetaLibrary')
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
				version: '1.0.0-beta',
				versionType: VersionType.PreRelease,
				npmBuildTool: 'yarn'
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Maven release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseLibrary')
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
				version: '1.2.0',
				versionType: VersionType.Release
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Maven pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenSnapshotLibrary')
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
				version: '1.2.0-SNAPSHOT',
				versionType: VersionType.PreRelease
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Docker release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'dockerReleaseImage')
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
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('Docker pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'dockerBetaImage')
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
				version: '1.0.0-beta',
				versionType: VersionType.PreRelease
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('GradleKotlin pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleKotlinPreReleaseLibrary')
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
				version: '1.0.0-SNAPSHOT',
				versionType: VersionType.PreRelease
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('GradleKotlin release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleKotlinReleaseLibrary')
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
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('HelmLibrary release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'helmReleaseLibrary')
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
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('HelmLibrary pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'helmPreReleaseLibrary')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmLibrary
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Helm pre-release projects are not currently supported')
		);
	});

	it('HelmApplication release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'helmReleaseApplication')
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
				version: '1.0.0',
				versionType: VersionType.Release
			}
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualRight(expectedContext);
	});

	it('HelmApplication pre-release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'helmPreReleaseApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.HelmApplication
		};
		const result = await getProjectInfo.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error('Helm pre-release projects are not currently supported')
		);
	});
});
