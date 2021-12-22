import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { match } from 'ts-pattern';
import { pipe } from 'fp-ts/function';
import { BuildToolInfo } from '../context/BuildToolInfo';
import * as TE from 'fp-ts/TaskEither';
import { searchForNpmReleases } from '../services/NexusRepoApi';
import semver from 'semver';
import { semverTrimVersion } from '../utils/semverUtils';
import { NexusSearchResult } from '../services/NexusSearchResult';
import { extractBuildToolInfo } from '../context/contextExtraction';
import { readUserInput } from '../utils/readUserInput';
import { logger } from '../logger';

const compareVersions = (
	nexusItemVersion: string,
	currentVersion: string
): boolean =>
	semver.compare(
		semverTrimVersion(nexusItemVersion),
		semverTrimVersion(currentVersion)
	) >= 0;

const noMatchingReleaseVersion = (
	result: NexusSearchResult,
	currentVersion: string
): boolean =>
	result.items.find((item) =>
		compareVersions(item.version, currentVersion)
	) === undefined;

const handleReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> =>
	pipe(
		searchForNpmReleases(buildToolInfo.group, buildToolInfo.name),
		TE.filterOrElse(
			(result) => noMatchingReleaseVersion(result, buildToolInfo.version),
			() =>
				new Error(
					`${buildToolInfo.name} has a newer release than ${buildToolInfo.version}. Please upgrade this tool.`
				)
		),
		TE.map(() => buildToolInfo)
	);

const handlePreReleaseUserResponse = (
	userResponse: string
): TE.TaskEither<Error, string> =>
	match(userResponse.toLowerCase())
		.with('y', () => {
			logger.debug(
				'User accepted running craig-build pre-release execution.'
			);
			return TE.right(userResponse);
		})
		.otherwise(() =>
			TE.left(
				new Error('User aborted craig-build pre-release execution.')
			)
		);

const handlePreReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> =>
	pipe(
		readUserInput(
			`craig-build is currently on pre-release version ${buildToolInfo.version}. Are you sure you want to run it? (y/n): `
		),
		TE.fromTask,
		TE.chain(handlePreReleaseUserResponse),
		TE.map(() => buildToolInfo)
	);

const checkBuildToolInfo = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> =>
	match(buildToolInfo)
		.with({ isPreRelease: true }, handlePreReleaseVersionValidation)
		.otherwise(handleReleaseVersionValidation);

const execute: StageFunction = (context: BuildContext) =>
	pipe(
		extractBuildToolInfo(context),
		TE.fromEither,
		TE.chain(checkBuildToolInfo),
		TE.map(() => context)
	);

export const validateBuildToolVersion: Stage = {
	name: 'Validate Build Tool Version',
	execute
};
