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
	searchForNpmBetas
} from '../services/NexusRepoApi';
import { NexusSearchResult } from '../services/NexusSearchResult';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { readFile } from '../functions/File';
import { homedir } from 'os';
import * as E from 'fp-ts/Either';
import path from 'path';
import { parseXml } from '../functions/Xml';
import { MavenMetadataNexus } from '../configFileTypes/MavenMetadataNexus';

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

const createMavenM2NexusPath = (context: BuildContext): string => {
	const groupPath = context.projectInfo.group.split('.').join(path.sep);
	return path.join(
		homedir(),
		'.m2',
		'repository',
		groupPath,
		context.projectInfo.name,
		context.projectInfo.version,
		'maven-metadata-nexus.xml'
	);
};

const getMavenMetadataPreReleaseVersion = (
	metadata: MavenMetadataNexus
): O.Option<string> =>
	pipe(
		metadata.metadata.versioning[0].snapshotVersions[0].snapshotVersion,
		A.findFirst((_) => _.extension[0] === 'jar'),
		O.map((_) => _.value[0])
	);

const handleMavenPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		createMavenM2NexusPath(context),
		readFile,
		E.chain((_) => parseXml<MavenMetadataNexus>(_)),
		E.chain((_) =>
			pipe(
				getMavenMetadataPreReleaseVersion(_),
				E.fromOption(
					() =>
						new Error(
							'Could not find Maven pre-release version in .m2'
						)
				)
			)
		),
		E.map((_) => updateProjectInfo(context, _)),
		TE.fromEither
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
