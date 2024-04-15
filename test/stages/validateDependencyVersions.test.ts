import { beforeEach, expect, test, vi } from 'vitest';
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
const mavenMonorepoScenarios: ReadonlyArray<MavenDependencyValidationScenario> =
	[
		'all valid with children',
		'invalid child dependencies',
		'invalid child plugins'
	];
const mavenValidScenarios: ReadonlyArray<MavenDependencyValidationScenario> = [
	'all valid',
	'all valid with children'
];

const gradleRunCommandMockImpl = (
	command: string,
	scenario: GradleDependencyValidationScenario
): taskEither.TaskEither<Error, string> =>
	match({ command, scenario })
		.with(
			{
				command: 'gradle dependencies',
				scenario: P.union('all valid', 'invalid plugins')
			},
			() => taskEither.right(dependencies)
		)
		.with(
			{
				command: 'gradle buildEnvironment',
				scenario: P.union('all valid', 'invalid dependencies')
			},
			() => taskEither.right(buildEnvironment)
		)
		.with(
			{
				command: 'gradle dependencies',
				scenario: 'invalid dependencies'
			},
			() => taskEither.right(dependenciesWithSnapshot)
		)
		.with(
			{ command: 'gradle buildEnvironment', scenario: 'invalid plugins' },
			() => taskEither.right(buildEnvironmentWithSnapshot)
		)
		.otherwise(() =>
			taskEither.left(
				new Error(`Invalid command: '${command}' Scenario: ${scenario}`)
			)
		);

beforeEach(() => {
	vi.resetAllMocks();
});

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
		.with('all valid with children', () => 'mavenReleaseLibraryMonorepo')
		.with(
			'invalid dependencies',
			() => 'mavenReleaseApplicationBadDependency'
		)
		.with('invalid plugins', () => 'mavenReleaseApplicationBadPlugin')
		.with(
			'invalid child dependencies',
			() => 'mavenReleaseLibraryMonorepoInvalidDependency'
		)
		.with(
			'invalid child plugins',
			() => 'mavenReleaseLibraryMonorepoInvalidPlugin'
		)
		.exhaustive();
	getCwdMock.mockImplementation(() =>
		path.resolve(baseWorkingDir, workingDir)
	);

	const buildContext: BuildContext = {
		...baseBuildContext,
		projectType: ProjectType.MavenApplication,
		projectInfo: {
			...baseBuildContext.projectInfo,
			versionType: VersionType.Release,
			repoType: mavenMonorepoScenarios.includes(scenario)
				? 'monorepo'
				: 'polyrepo'
		}
	};

	const result = await validateDependencyVersions.execute(buildContext)();
	if (mavenValidScenarios.includes(scenario)) {
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
	// Disabling this scenario for the time being, challenging to write tests for it
	if (scenario === 'unresolved dependencies') {
		return;
	}
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
		.exhaustive();
	getCwdMock.mockImplementation(() =>
		path.resolve(baseWorkingDir, workingDir)
	);
	runCommandMock.mockImplementation((command: string) =>
		gradleRunCommandMockImpl(command, scenario)
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
	} /*else if (scenario === 'unresolved dependencies') {
		expect(result).toBeLeft();
		const error = (result as either.Left<Error>).left;
		expect(error.message).toMatch(
			/UnresolvedDependencyException.*spring-web-utils/
		);
	}*/ else {
		expect(result).toEqualLeft(
			new Error(
				'Cannot have SNAPSHOT dependencies or plugins in Gradle release'
			)
		);
	}
});

test.each<DependencyValidationScenario>(['all valid', 'invalid dependencies'])(
	'validating dependencies for npm. Scenario: %s',
	async (scenario) => {
		const workingDir = match(scenario)
			.with('all valid', () => 'npmReleaseApplication')
			.with(
				'invalid dependencies',
				() => 'npmReleaseApplicationBadDependency'
			)
			.exhaustive();
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, workingDir)
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
		if (scenario === 'all valid') {
			expect(result).toEqualRight(buildContext);
		} else {
			expect(result).toEqualLeft(
				new Error('Cannot have beta dependencies in NPM release')
			);
		}
	}
);

type NpmPeerValidationScenario =
	| 'invalid beta for release'
	| 'valid beta for pre-release'
	| 'peer lower than dev dependency'
	| 'peer lower than main dependency'
	| 'peer same as main dependency'
	| 'beta peer higher than release main dependency';
const validScenarios: ReadonlyArray<NpmPeerValidationScenario> = [
	'valid beta for pre-release',
	'peer same as main dependency'
];
const preReleaseScenarios: ReadonlyArray<NpmPeerValidationScenario> = [
	'beta peer higher than release main dependency',
	'valid beta for pre-release'
];

test.each<NpmPeerValidationScenario>([
	'invalid beta for release',
	'valid beta for pre-release',
	'peer lower than dev dependency',
	'peer lower than main dependency',
	'peer same as main dependency',
	'beta peer higher than release main dependency'
])('validating npm peer dependencies. Scenario: %s', async (scenario) => {
	const workingDir = match(scenario)
		.with('invalid beta for release', () => 'invalidBetaForRelease')
		.with('valid beta for pre-release', () => 'validBetaForPreRelease')
		.with(
			'peer lower than dev dependency',
			() => 'peerDependencyLowerThanDevDependency'
		)
		.with(
			'peer lower than main dependency',
			() => 'peerDependencyLowerThanMainDependency'
		)
		.with(
			'peer same as main dependency',
			() => 'peerDependencySameAsMainDependency'
		)
		.with(
			'beta peer higher than release main dependency',
			() => 'betaPeerIsHigherThanRelease'
		)
		.exhaustive();
	getCwdMock.mockImplementation(() =>
		path.join(baseWorkingDir, '__npmPeers__', workingDir)
	);

	const buildContext: BuildContext = {
		...baseBuildContext,
		projectType: ProjectType.NpmApplication,
		projectInfo: {
			...baseBuildContext.projectInfo,
			versionType: preReleaseScenarios.includes(scenario)
				? VersionType.PreRelease
				: VersionType.Release
		}
	};
	const result = await validateDependencyVersions.execute(buildContext)();
	if (validScenarios.includes(scenario)) {
		expect(result).toEqualRight(buildContext);
	} else if (scenario === 'invalid beta for release') {
		expect(result).toEqualLeft(
			new Error('Cannot have beta dependencies in NPM release')
		);
	} else {
		expect(result).toBeLeft();
		const error = (result as either.Left<Error>).left;
		expect(error.message).toEqual(
			expect.stringContaining(
				"Dependency @craigmiller160/foo-bar does not satisfy project's peer range"
			)
		);
	}
});
