import { runCommandMock } from '../testutils/runCommandMock';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { VersionType } from '../../src/context/VersionType';
import '../testutils/readGradleProjectUnmock';
import { either } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { match, P } from 'ts-pattern';
import fs from 'fs';

const baseBuildContext = createBuildContext();

const gradleOutput = path.join(process.cwd(), 'test', '__gradle-output__');
const buildEnvironment = fs.readFileSync(
	path.join(gradleOutput, 'buildEnvironment.txt'),
	'utf8'
);
const buildEnvironmentWithSnapshot = fs.readFileSync(
	path.join(gradleOutput, 'buildEnvironment_withSnapshot.txt'),
	'utf8'
);
const dependencies = fs.readFileSync(
	path.join(gradleOutput, 'dependencies.txt'),
	'utf8'
);
const dependenciesWithSnapshot = fs.readFileSync(
	path.join(gradleOutput, 'dependencies_withSnapshot.txt'),
	'utf8'
);

type GradleSnapshot = 'none' | 'plugins' | 'dependencies';

const runCommandMockImpl = (
	command: string,
	snapshot: GradleSnapshot
): taskEither.TaskEither<Error, string> =>
	match({ command, snapshot })
		.with(
			{
				command: 'gradle dependencies',
				snapshot: P.union('none', 'plugins')
			},
			() => taskEither.right(dependencies)
		)
		.with(
			{
				command: 'gradle buildEnvironment',
				snapshot: P.union('none', 'dependencies')
			},
			() => taskEither.right(buildEnvironment)
		)
		.with(
			{ command: 'gradle dependencies', snapshot: 'dependencies' },
			() => taskEither.right(dependenciesWithSnapshot)
		)
		.with({ command: 'gradle buildEnvironment', snapshot: 'plugins' }, () =>
			taskEither.right(buildEnvironmentWithSnapshot)
		)
		.otherwise(() =>
			taskEither.left(
				new Error(`Invalid command: '${command}' Snapshot: ${snapshot}`)
			)
		);

describe('validateDependencyVersions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('all release dependencies and plugins are valid for maven project', async () => {
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

	it('all release dependencies and plugins are valid for gradle kotlin project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'gradleKotlinReleaseApplication')
		);
		runCommandMock.mockImplementation((command: string) =>
			runCommandMockImpl(command, 'none')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
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
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Maven release'
			)
		);
	});

	it('invalid release plugins for maven project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenReleaseApplicationBadPlugin')
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
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Maven release'
			)
		);
	});

	it('invalid release dependencies for gradle kotlin project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'gradleKotlinReleaseApplicationBadDependency'
			)
		);
		runCommandMock.mockImplementation((command: string) =>
			runCommandMockImpl(command, 'dependencies')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Gradle release'
			)
		);
	});

	it('invalid release plugins for gradle kotlin project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'gradleKotlinReleaseApplicationBadPlugin'
			)
		);
		runCommandMock.mockImplementation((command: string) =>
			runCommandMockImpl(command, 'plugins')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualLeft(
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Gradle release'
			)
		);
	});

	it.skip('unresolved dependency for gradle kotlin project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(
				baseWorkingDir,
				'gradleKotlinReleaseApplicationUnresolvedDependency'
			)
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.GradleApplication,
			projectInfo: {
				...baseBuildContext.projectInfo,
				versionType: VersionType.Release
			}
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toBeLeft();
		const error = (result as either.Left<Error>).left;
		expect(error.message).toMatch(
			/UnresolvedDependencyException.*spring-web-utils/
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

	describe('npm peer dependencies', () => {
		const npmPeersRoot = path.join(baseWorkingDir, '__npmPeers__');

		it('invalid beta for release project', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(npmPeersRoot, 'invalidBetaForRelease')
			);
			const buildContext: BuildContext = {
				...baseBuildContext,
				projectType: ProjectType.NpmApplication,
				projectInfo: {
					...baseBuildContext.projectInfo,
					versionType: VersionType.Release
				}
			};

			const result = await validateDependencyVersions.execute(
				buildContext
			)();
			expect(result).toEqualLeft(
				new Error('Cannot have beta dependencies in NPM release')
			);
		});

		it('valid beta for pre-release project', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(npmPeersRoot, 'validBetaForPreRelease')
			);
			const buildContext: BuildContext = {
				...baseBuildContext,
				projectType: ProjectType.NpmApplication,
				projectInfo: {
					...baseBuildContext.projectInfo,
					versionType: VersionType.PreRelease,
					version: '1.0.0-beta'
				}
			};

			const result = await validateDependencyVersions.execute(
				buildContext
			)();
			expect(result).toEqualRight(buildContext);
		});

		it('peer dependency version lower than dev dependency version', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(
					npmPeersRoot,
					'peerDependencyLowerThanDevDependency'
				)
			);
			const buildContext: BuildContext = {
				...baseBuildContext,
				projectType: ProjectType.NpmApplication,
				projectInfo: {
					...baseBuildContext.projectInfo,
					versionType: VersionType.Release
				}
			};

			const result = await validateDependencyVersions.execute(
				buildContext
			)();
			expect(result).toEqualLeft(
				new Error(
					"Dependency @craigmiller160/foo-bar does not satisfy project's peer range"
				)
			);
		});

		it('peer dependency version lower than main dependency version', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(npmPeersRoot, 'peerDependencyLowerThanDependency')
			);
			const buildContext: BuildContext = {
				...baseBuildContext,
				projectType: ProjectType.NpmApplication,
				projectInfo: {
					...baseBuildContext.projectInfo,
					versionType: VersionType.Release
				}
			};

			const result = await validateDependencyVersions.execute(
				buildContext
			)();
			expect(result).toEqualLeft(
				new Error(
					"Dependency @craigmiller160/foo-bar does not satisfy project's peer range"
				)
			);
		});

		it('beta peer dependency is higher than release main dependency', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(npmPeersRoot, 'betaPeerIsHigherThanRelease')
			);
			const buildContext: BuildContext = {
				...baseBuildContext,
				projectType: ProjectType.NpmApplication,
				projectInfo: {
					...baseBuildContext.projectInfo,
					versionType: VersionType.PreRelease,
					version: '1.0.0-beta'
				}
			};

			const result = await validateDependencyVersions.execute(
				buildContext
			)();
			expect(result).toEqualLeft(
				new Error(
					"Dependency @craigmiller160/foo-bar does not satisfy project's peer range"
				)
			);
		});
	});
});
