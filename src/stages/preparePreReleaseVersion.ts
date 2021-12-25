import { Stage, StageFunction } from './Stage';
import * as TE from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isDocker, isMaven, isNpm } from '../context/projectTypeUtils';
import { isPreRelease } from '../context/projectInfoUtils';
import { pipe } from 'fp-ts/function';
import {
	searchForDockerBetas,
	searchForMavenSnapshots,
	searchForNpmBetas
} from '../services/NexusRepoApi';
import { NexusSearchResult } from '../services/NexusSearchResult';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';

const BETA_VERSION_REGEX = /^(?<version>.*-beta)\.(?<betaNumber>\d*)$/;

interface BetaRegexGroups {
	version: string;
	betaNumber: string;
}

const findMatchingVersion = (
	nexusResult: NexusSearchResult,
	version: string
): O.Option<string> =>
	pipe(
		nexusResult.items,
		A.findFirst((_) => _.version.startsWith(version)),
		O.map((_) => _.version)
	);

const updateProjectInfo = (
	context: BuildContext,
	version: string
): BuildContext => ({
	...context,
	projectInfo: {
		...context.projectInfo,
		version
	}
});

// TODO consider instead reading the version from the build output
// TODO or maybe query .m2?
// TODO querying .m2, /group/name/version/maven-metadata-nexus.xml, /metadata/versioning/snapshotVersions/snapshotVersion[extension="jar"]/value
// TODO above file path and xpath gives you the pre-release version
const handleMavenPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		searchForMavenSnapshots(
			context.projectInfo.group,
			context.projectInfo.name
		),
		TE.chain((nexusResult) =>
			pipe(
				// TODO what if it grabs the old version?
				findMatchingVersion(nexusResult, context.projectInfo.version),
				TE.fromOption(
					() =>
						new Error(
							'Cannot find matching Maven pre-release artifact'
						)
				)
			)
		),
		TE.map((_) => updateProjectInfo(context, _))
	);

const bumpBetaVersion = (fullVersion: string): string => {
	const { version, betaNumber } = BETA_VERSION_REGEX.exec(fullVersion)
		?.groups as unknown as BetaRegexGroups;
	const newBetaNumber = parseInt(betaNumber) + 1;
	return `${version}.${newBetaNumber}`;
};

const handleNpmPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		searchForNpmBetas(context.projectInfo.group, context.projectInfo.name),
		TE.map((nexusResult) =>
			pipe(
				findMatchingVersion(nexusResult, context.projectInfo.version),
				O.map(bumpBetaVersion),
				O.getOrElse(() => `${context.projectInfo.version}.1`)
			)
		),
		TE.map((_) => updateProjectInfo(context, _))
	);

const handleDockerPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		searchForDockerBetas(context.projectInfo.name),
		TE.map((nexusResult) =>
			pipe(
				findMatchingVersion(nexusResult, context.projectInfo.version),
				O.map(bumpBetaVersion),
				O.getOrElse(() => `${context.projectInfo.version}.1`)
			)
		),
		TE.map((_) => updateProjectInfo(context, _))
	);

const handlePreparingPreReleaseVersionByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{ projectType: when(isMaven), projectInfo: when(isPreRelease) },
			handleMavenPreReleaseVersion
		)
		.with(
			{ projectType: when(isNpm), projectInfo: when(isPreRelease) },
			handleNpmPreReleaseVersion
		)
		.with(
			{ projectType: when(isDocker), projectInfo: when(isPreRelease) },
			handleDockerPreReleaseVersion
		)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) =>
	handlePreparingPreReleaseVersionByProject(context);

export const preparePreReleaseVersion: Stage = {
	name: 'Prepare Pre-Release Version',
	execute
};
