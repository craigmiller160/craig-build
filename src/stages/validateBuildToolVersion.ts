import { Stage, StageExecuteFn } from './Stage';
import { match } from 'ts-pattern';
import { function as func } from 'fp-ts';
import { BuildToolInfo } from '../context/BuildToolInfo';
import { taskEither } from 'fp-ts';
import * as P from 'fp-ts/Predicate';
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
		.with(
			{ versionType: VersionType.PreRelease },
			handlePreReleaseVersionValidation
		)
		.otherwise(handleReleaseVersionValidation);

const execute: StageExecuteFn = (context) =>
	pipe(
		checkBuildToolInfo(context.buildToolInfo),
		TE.map(() => context)
	);
const shouldStageExecute: P.Predicate<BuildContext> = () => true;

export const validateBuildToolVersion: Stage = {
	name: 'Validate Build Tool Version',
	execute,
	shouldStageExecute
};
