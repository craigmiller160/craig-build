import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { match, when } from 'ts-pattern';
import { pipe } from 'fp-ts/function';
import { BuildToolInfo } from '../context/BuildToolInfo';
import * as TE from 'fp-ts/TaskEither';
import { searchForNpmReleases } from '../services/NexusRepoApi';
import semver from 'semver';
import { semverTrimVersion } from '../utils/semverUtils';
import { NexusSearchResult } from '../services/NexusSearchResult';

[].find((item) => semver.compare(item, '') >= 0);

const handleReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> =>
	pipe(
		searchForNpmReleases(buildToolInfo.group, buildToolInfo.name),
		TE.filterOrElse(
			(result: NexusSearchResult) =>
				result.items.filter(
					(item) =>
						semver.compare(
							semverTrimVersion(item.version),
							semverTrimVersion(buildToolInfo.version)
						) >= 0
				).length === 0,
			() =>
				new Error(
					`${buildToolInfo.name} has a newer release than ${buildToolInfo.version}. Please upgrade this tool.`
				)
		),
		TE.map(() => buildToolInfo)
	);

const handlePreReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> => {
	// TODO finish this
	throw new Error();
};

const checkBuildToolInfo = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> =>
	match(buildToolInfo)
		.with({ isPreRelease: true }, handlePreReleaseVersionValidation)
		.otherwise(handleReleaseVersionValidation);

const execute: StageFunction = (context: BuildContext) =>
	pipe(
		context.buildToolInfo,
		TE.fromOption(
			() =>
				new Error(
					'Cannot validate build tool version when BuildToolInfo is not present'
				)
		),
		TE.chain(checkBuildToolInfo),
		TE.map(() => context)
	);

export const validateBuildToolVersion: Stage = {
	name: 'Validate Build Tool Version',
	execute
};
