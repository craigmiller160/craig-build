import { Stage, StageExecuteFn } from './Stage';
import { match } from 'ts-pattern';
import { function as func } from 'fp-ts';
import { BuildToolInfo } from '../context/BuildToolInfo';
import { taskEither, predicate } from 'fp-ts';
import { searchForNpmReleases } from '../services/NexusRepoApi';
import semver from 'semver';
import { semverTrimVersion } from '../utils/semverUtils';
import { NexusSearchResult } from '../services/NexusSearchResult';
import { readUserInput } from '../utils/readUserInput';
import { logger } from '../logger';
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';

const compareVersions = (
	nexusItemVersion: string,
	currentVersion: string
): boolean =>
	semver.compare(
		semverTrimVersion(nexusItemVersion),
		semverTrimVersion(currentVersion)
	) > 0;

const noMatchingReleaseVersion = (
	result: NexusSearchResult,
	currentVersion: string
): boolean =>
	result.items.find((item) =>
		compareVersions(item.version, currentVersion)
	) === undefined;

const handleReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): taskEither.TaskEither<Error, BuildToolInfo> =>
	func.pipe(
		searchForNpmReleases(buildToolInfo.group, buildToolInfo.name),
		taskEither.filterOrElse(
			(result) => noMatchingReleaseVersion(result, buildToolInfo.version),
			() =>
				new Error(
					`${buildToolInfo.name} has a newer release than ${buildToolInfo.version}. Please upgrade this tool.`
				)
		),
		taskEither.map(() => buildToolInfo)
	);

const handlePreReleaseUserResponse = (
	userResponse: string
): taskEither.TaskEither<Error, string> =>
	match(userResponse.toLowerCase())
		.with('y', () => {
			logger.debug(
				'User accepted running craig-build pre-release execution.'
			);
			return taskEither.right(userResponse);
		})
		.otherwise(() =>
			taskEither.left(
				new Error('User aborted craig-build pre-release execution.')
			)
		);

const handlePreReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): taskEither.TaskEither<Error, BuildToolInfo> =>
	func.pipe(
		readUserInput(
			`craig-build is currently on pre-release version ${buildToolInfo.version}. Are you sure you want to run it? (y/n): `
		),
		taskEither.fromTask,
		taskEither.chain(handlePreReleaseUserResponse),
		taskEither.map(() => buildToolInfo)
	);

const checkBuildToolInfo = (
	buildToolInfo: BuildToolInfo
): taskEither.TaskEither<Error, BuildToolInfo> =>
	match(buildToolInfo)
		.with(
			{ versionType: VersionType.PreRelease },
			handlePreReleaseVersionValidation
		)
		.otherwise(handleReleaseVersionValidation);

const execute: StageExecuteFn = (context) =>
	func.pipe(
		checkBuildToolInfo(context.buildToolInfo),
		taskEither.map(() => context)
	);
const shouldStageExecute: predicate.Predicate<BuildContext> = () => true;

export const validateBuildToolVersion: Stage = {
	name: 'Validate Build Tool Version',
	execute,
	shouldStageExecute
};
