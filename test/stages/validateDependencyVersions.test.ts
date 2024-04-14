import { beforeEach, describe, expect, it, vi, test } from 'vitest';
import { runCommandMock } from '../testutils/runCommandMock';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';
import { VersionType } from '../../src/context/VersionType';
import '../testutils/readGradleProjectMock';
import { either, taskEither } from 'fp-ts';
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

beforeEach(() => {
	vi.resetAllMocks();
});

/**
 * Maven & Gradle
 * 1. Dependencies & Plugins Valid
 * 2. Invalid Dependencies
 * 3. Invalid Plugins
 * 4. Gradle Only - Unresolved Dependency
 */

type DependencyValidationScenario = 'all valid' | 'invalid dependencies';
type MonorepoDependencyValidationScenario =
	| DependencyValidationScenario
	| 'all valid with children'
	| 'invalid child dependencies';
type MavenDependencyValidationScenario =
	| MonorepoDependencyValidationScenario
	| 'invalid plugins'
	| 'invalid child plugins';
type GradleDependencyValidationScenario =
	| DependencyValidationScenario
	| 'invalid plugins'
	| 'unresolved dependencies';

test.each<MavenDependencyValidationScenario>([
	'all valid',
	'all valid with children',
	'invalid dependencies',
	'invalid plugins',
	'invalid child dependencies',
	'invalid child plugins'
])('validating dependencies for maven. Scenario: %s', async (scenario) => {
	const workingDir = match(scenario)
		.with('all valid', () => 'mavenReleaseApplication')
		.with('all valid with children', () => {
			throw new Error();
		})
		.with(
			'invalid dependencies',
			() => 'mavenReleaseApplicationBadDependency'
		)
		.with('invalid plugins', () => 'mavenReleaseApplicationBadPlugin')
		.with('invalid child dependencies', () => {
			throw new Error();
		})
		.with('invalid child plugins', () => {
			throw new Error();
		})
		.exhaustive();
	getCwdMock.mockImplementation(() =>
		path.resolve(baseWorkingDir, workingDir)
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
	if (scenario === 'all valid') {
		expect(result).toEqualRight(buildContext);
	} else {
		expect(result).toEqualLeft(
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Maven release'
			)
		);
	}
});

test.each<GradleDependencyValidationScenario>([
	'all valid',
	'invalid dependencies',
	'invalid plugins',
	'unresolved dependencies'
])('validating dependencies for gradle. Scenario: %s', async (scenario) => {
	const workingDir = match(scenario)
		.with('all valid', () => 'gradleKotlinReleaseApplication')
		.with(
			'invalid dependencies',
			() => 'gradleKotlinReleaseApplicationBadDependency'
		)
		.with(
			'invalid plugins',
			() => 'gradleKotlinReleaseApplicationBadPlugin'
		)
		.with(
			'unresolved dependencies',
			() => 'gradleKotlinReleaseApplicationUnresolvedDependency'
		)
		.exhaustive();
	getCwdMock.mockImplementation(() =>
		path.resolve(baseWorkingDir, workingDir)
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
	if (scenario === 'all valid') {
		expect(result).toEqualRight(buildContext);
	} else if (scenario === 'unresolved dependencies') {
		expect(result).toBeLeft();
		const error = (result as either.Left<Error>).left;
		expect(error.message).toMatch(
			/UnresolvedDependencyException.*spring-web-utils/
		);
	} else {
		expect(result).toEqualLeft(
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Gradle release'
			)
		);
	}
});

describe('validateDependencyVersions', () => {
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

			const result =
				await validateDependencyVersions.execute(buildContext)();
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

			const result =
				await validateDependencyVersions.execute(buildContext)();
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

			const result =
				await validateDependencyVersions.execute(buildContext)();
			expect(result).toEqualLeft(
				new Error(
					"Dependency @craigmiller160/foo-bar does not satisfy project's peer range. Version: ^2.0.0 Range: ^1.0.0"
				)
			);
		});

		it('peer dependency version lower than main dependency version', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(
					npmPeersRoot,
					'peerDependencyLowerThanMainDependency'
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

			const result =
				await validateDependencyVersions.execute(buildContext)();
			expect(result).toEqualLeft(
				new Error(
					"Dependency @craigmiller160/foo-bar does not satisfy project's peer range. Version: ^2.0.0 Range: ^1.0.0"
				)
			);
		});

		it('peer dependency version the same as main dependency version', async () => {
			getCwdMock.mockImplementation(() =>
				path.resolve(npmPeersRoot, 'peerDependencySameAsMainDependency')
			);
			const buildContext: BuildContext = {
				...baseBuildContext,
				projectType: ProjectType.NpmApplication,
				projectInfo: {
					...baseBuildContext.projectInfo,
					versionType: VersionType.Release
				}
			};

			const result =
				await validateDependencyVersions.execute(buildContext)();
			expect(result).toBeRight();
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

			const result =
				await validateDependencyVersions.execute(buildContext)();
			expect(result).toEqualLeft(
				new Error(
					"Dependency @craigmiller160/foo-bar does not satisfy project's peer range. Version: ^1.0.0 Range: ^1.1.0-beta"
				)
			);
		});
	});
});
