import * as TE from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';
import { match, P } from 'ts-pattern';
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
import { readFile } from '../functions/File';
import { homedir } from 'os';
import * as E from 'fp-ts/Either';
import path from 'path';
import * as Pred from 'fp-ts/Predicate';
import { parseXml } from '../functions/Xml';
import { MavenMetadataNexus } from '../configFileTypes/MavenMetadataNexus';
import { Stage, StageExecuteFn } from './Stage';
import { regexExecGroups } from '../functions/RegExp';
import { isDockerOnly, isFullBuild } from '../context/commandTypeUtils';
import { CommandType } from '../context/CommandType';
import { isNone, isSome } from 'fp-ts/Option';
import { ProjectInfo } from '../context/ProjectInfo';
import { logger } from '../logger';
import { stringifyJson } from '../functions/Json';

interface BetaRegexGroups {
	readonly version: string;
	readonly betaNumber: string;
}

interface NpmBetaSearchInfo {
	readonly name: string;
	readonly group: string;
	readonly version: string;
	readonly nexusVersions: ReadonlyArray<string>;
}

const BETA_VERSION_REGEX = /^(?<version>.*-beta)\.(?<betaNumber>\d*)$/;
const betaVersionRegexExecGroups =
	regexExecGroups<BetaRegexGroups>(BETA_VERSION_REGEX);

const npmBumpBetaCommandTypePredicate: Pred.Predicate<CommandType> =
	isFullBuild;
const dockerBumpBetaCommandTypePredicate: Pred.Predicate<CommandType> = pipe(
	isFullBuild,
	Pred.or(isDockerOnly)
);

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

const handleFullBuildMavenPreReleaseVersion = (
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

const bumpBetaVersion = (fullVersion: string): O.Option<string> =>
	pipe(
		betaVersionRegexExecGroups(fullVersion),
		O.map(({ version, betaNumber }) => {
			const newBetaNumber = parseInt(betaNumber) + 1;
			return `${version}.${newBetaNumber}`;
		})
	);

const prepareVersionSearchParam = (version: string): string => {
	const formattedVersion = version.replaceAll('SNAPSHOT', '');
	return `${formattedVersion}*`;
};

const handleNonFullBuildMavenPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const versionSearchParam = prepareVersionSearchParam(
		context.projectInfo.version
	);
	return pipe(
		searchForMavenSnapshots(
			context.projectInfo.group,
			context.projectInfo.name,
			versionSearchParam
		),
		TE.chain((nexusResult) =>
			pipe(
				findMatchingVersion(
					nexusResult,
					context.projectInfo.version.replaceAll('SNAPSHOT', '')
				),
				TE.fromOption(
					() =>
						new Error(
							'No matching Maven pre-release versions in Nexus'
						)
				)
			)
		),
		TE.map((_) => updateProjectInfo(context, _))
	);
};

const handleBetaVersionIfFound =
	(
		context: BuildContext,
		bumpBetaCommandTypePredicate: Pred.Predicate<CommandType>
	) =>
	(versionOption: O.Option<string>) =>
		match({ commandType: context.commandInfo.type, version: versionOption })
			.with(
				{
					commandType: P.when(bumpBetaCommandTypePredicate),
					version: P.when(isSome)
				},
				({ version }) => O.chain(bumpBetaVersion)(version)
			)
			.with({ version: P.when(isSome) }, ({ version }) => version)
			.with(
				{
					commandType: P.when(bumpBetaCommandTypePredicate),
					version: P.when(isNone)
				},
				() => O.some(`${context.projectInfo.version}.1`)
			)
			.otherwise(() => O.none);

const logNpmBetaSearch = (
	projectInfo: ProjectInfo,
	versionSearchParam: string,
	nexusResult: NexusSearchResult
): NexusSearchResult => {
	const searchInfo: NpmBetaSearchInfo = {
		name: projectInfo.name,
		group: projectInfo.group,
		version: versionSearchParam,
		nexusVersions: nexusResult.items.map((item) => item.version)
	};
	pipe(
		stringifyJson(searchInfo, 2),
		E.fold(
			(ex) => {
				logger.error('Error logging NPM Beta Search Info');
				logger.error(ex);
			},
			(json) => {
				logger.debug(`NPM Beta Search Info: ${json}`);
			}
		)
	);
	return nexusResult;
};

const handleNpmPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const versionSearchParam = prepareVersionSearchParam(
		context.projectInfo.version
	);
	return pipe(
		searchForNpmBetas(
			context.projectInfo.group,
			context.projectInfo.name,
			versionSearchParam
		),
		TE.map((nexusResult) =>
			logNpmBetaSearch(
				context.projectInfo,
				versionSearchParam,
				nexusResult
			)
		),
		TE.chain((nexusResult) =>
			pipe(
				findMatchingVersion(nexusResult, context.projectInfo.version),
				handleBetaVersionIfFound(
					context,
					npmBumpBetaCommandTypePredicate
				),
				TE.fromOption(
					() =>
						new Error(
							'No matching NPM pre-release versions in Nexus'
						)
				)
			)
		),
		TE.map((_) => updateProjectInfo(context, _))
	);
};

const handleDockerPreReleaseVersion = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const versionSearchParam = prepareVersionSearchParam(
		context.projectInfo.version
	);
	return pipe(
		searchForDockerBetas(context.projectInfo.name, versionSearchParam),
		TE.chain((nexusResult) =>
			pipe(
				findMatchingVersion(nexusResult, context.projectInfo.version),
				handleBetaVersionIfFound(
					context,
					dockerBumpBetaCommandTypePredicate
				),
				TE.fromOption(
					() =>
						new Error(
							'No matching Docker pre-release versions in Nexus'
						)
				)
			)
		),
		TE.map((_) => updateProjectInfo(context, _))
	);
};

const handlePreparingPreReleaseVersionByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with(
			{
				commandInfo: { type: P.when(isFullBuild) },
				projectType: P.when(isMaven),
				projectInfo: P.when(isPreRelease)
			},
			handleFullBuildMavenPreReleaseVersion
		)
		.with(
			{ projectType: P.when(isMaven), projectInfo: P.when(isPreRelease) },
			handleNonFullBuildMavenPreReleaseVersion
		)
		.with(
			{ projectType: P.when(isNpm), projectInfo: P.when(isPreRelease) },
			handleNpmPreReleaseVersion
		)
		.with(
			{
				projectType: P.when(isDocker),
				projectInfo: P.when(isPreRelease)
			},
			handleDockerPreReleaseVersion
		)
		.run();

const execute: StageExecuteFn = (context) =>
	handlePreparingPreReleaseVersionByProject(context);
const shouldStageExecute: Pred.Predicate<BuildContext> = (context) =>
	isPreRelease(context.projectInfo);

export const preparePreReleaseVersion: Stage = {
	name: 'Prepare Pre-Release Version',
	execute,
	shouldStageExecute
};
