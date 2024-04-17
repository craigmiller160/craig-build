import { readonlyArray, taskEither } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';
import { match, P } from 'ts-pattern';
import {
	isDocker,
	isGradle,
	isMaven,
	isNpm
} from '../context/projectTypeUtils';
import { isPreRelease } from '../context/projectInfoUtils';
import { function as func } from 'fp-ts';
import {
	searchForDockerBetas,
	searchForMavenSnapshots,
	searchForNpmBetas
} from '../services/NexusRepoApi';
import { NexusSearchResult } from '../services/NexusSearchResult';
import { option } from 'fp-ts';
import { array } from 'fp-ts';
import { readFile } from '../functions/File';
import { homedir } from 'os';
import { either } from 'fp-ts';
import path from 'path';
import { predicate } from 'fp-ts';
import { parseXml } from '../functions/Xml';
import { MavenMetadataNexus } from '../configFileTypes/MavenMetadataNexus';
import { Stage, StageExecuteFn } from './Stage';
import { regexExecGroups } from '../functions/RegExp';
import {
	isDockerOnly,
	isFullBuild,
	isTerraformOnly
} from '../context/commandTypeUtils';
import { CommandType } from '../context/CommandType';
import { ProjectInfo } from '../context/ProjectInfo';
import { logger } from '../logger';
import { stringifyJson } from '../functions/Json';

const { isSome, isNone } = option;

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

const npmBumpBetaCommandTypePredicate: predicate.Predicate<CommandType> =
	isFullBuild;
const dockerBumpBetaCommandTypePredicate: predicate.Predicate<CommandType> =
	func.pipe(isFullBuild, predicate.or(isDockerOnly));

const findMatchingVersion = (
	nexusResult: NexusSearchResult,
	version: string
): option.Option<string> =>
	func.pipe(
		nexusResult.items,
		array.findFirst((_) => _.version.startsWith(version)),
		option.map((_) => _.version)
	);

const updateBuildContext = (
	context: BuildContext,
	version: string
): BuildContext => ({
	...context,
	projectInfo: {
		...context.projectInfo,
		version
	}
});

const updateProjectInfo = (
	projectInfo: ProjectInfo,
	version: string
): ProjectInfo => ({
	...projectInfo,
	version
});

const createMavenM2NexusPath = (projectInfo: ProjectInfo): string => {
	const groupPath = projectInfo.group.split('.').join(path.sep);
	return path.join(
		homedir(),
		'.m2',
		'repository',
		groupPath,
		projectInfo.name,
		projectInfo.version,
		'maven-metadata-nexus.xml'
	);
};

const getMavenMetadataPreReleaseVersion = (
	metadata: MavenMetadataNexus
): option.Option<string> =>
	func.pipe(
		metadata.metadata.versioning[0].snapshotVersions[0].snapshotVersion,
		array.findFirst((_) => _.extension[0] === 'jar'),
		option.map((_) => _.value[0])
	);

const getM2PreReleaseVersionForProjectInfo = (
	projectInfo: ProjectInfo
): either.Either<Error, ProjectInfo> =>
	func.pipe(
		createMavenM2NexusPath(projectInfo),
		readFile,
		either.chain((_) => parseXml<MavenMetadataNexus>(_)),
		either.chain((_) =>
			func.pipe(
				getMavenMetadataPreReleaseVersion(_),
				either.fromOption(
					() =>
						new Error(
							'Could not find Maven pre-release version in .m2'
						)
				)
			)
		),
		either.map((_) => updateProjectInfo(projectInfo, _))
	);

const handleFullBuildMavenPreReleaseVersion = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const rootProjectInfoEither = getM2PreReleaseVersionForProjectInfo(
		context.projectInfo
	);

	const monorepoChildProjectInfo = func.pipe(
		context.projectInfo.monorepoChildren ?? [],
		readonlyArray.map(getM2PreReleaseVersionForProjectInfo),
		either.sequenceArray,
		either.map((children) => (children.length === 0 ? undefined : children))
	);

	return func.pipe(
		rootProjectInfoEither,
		either.bindTo('rootProjectInfo'),
		either.bind('monorepoChildren', () => monorepoChildProjectInfo),
		either.map(
			({ rootProjectInfo, monorepoChildren }): ProjectInfo => ({
				...rootProjectInfo,
				monorepoChildren
			})
		),
		either.map(
			(projectInfo): BuildContext => ({
				...context,
				projectInfo
			})
		),
		taskEither.fromEither
	);
};

const bumpBetaVersion = (fullVersion: string): option.Option<string> =>
	func.pipe(
		betaVersionRegexExecGroups(fullVersion),
		option.map(({ version, betaNumber }) => {
			const newBetaNumber = parseInt(betaNumber) + 1;
			return `${version}.${newBetaNumber}`;
		})
	);

const prepareVersionSearchParam = (version: string): string => {
	const formattedVersion = version.replaceAll('SNAPSHOT', '');
	return `${formattedVersion}*`;
};

const handleMavenPreReleaseVersionFromNexus = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const versionSearchParam = prepareVersionSearchParam(
		context.projectInfo.version
	);
	return func.pipe(
		searchForMavenSnapshots(
			context.projectInfo.group,
			context.projectInfo.name,
			versionSearchParam
		),
		taskEither.chain((nexusResult) =>
			func.pipe(
				findMatchingVersion(
					nexusResult,
					context.projectInfo.version.replaceAll('SNAPSHOT', '')
				),
				taskEither.fromOption(
					() =>
						new Error(
							'No matching Maven pre-release versions in Nexus'
						)
				)
			)
		),
		taskEither.map((_) => updateBuildContext(context, _))
	);
};

const handleBetaVersionIfFound =
	(
		context: BuildContext,
		bumpBetaCommandTypePredicate: predicate.Predicate<CommandType>
	) =>
	(versionOption: option.Option<string>) =>
		match({ commandType: context.commandInfo.type, version: versionOption })
			.with(
				{
					commandType: P.when(bumpBetaCommandTypePredicate),
					version: P.when(isSome)
				},
				({ version }) => option.chain(bumpBetaVersion)(version)
			)
			.with({ version: P.when(isSome) }, ({ version }) => version)
			.with(
				{
					commandType: P.when(bumpBetaCommandTypePredicate),
					version: P.when(isNone)
				},
				() => option.some(`${context.projectInfo.version}.1`)
			)
			.otherwise(() => option.none);

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
	func.pipe(
		stringifyJson(searchInfo, 2),
		either.fold(
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
): taskEither.TaskEither<Error, BuildContext> => {
	const versionSearchParam = prepareVersionSearchParam(
		context.projectInfo.version
	);
	return func.pipe(
		searchForNpmBetas(
			context.projectInfo.group,
			context.projectInfo.name,
			versionSearchParam
		),
		taskEither.map((nexusResult) =>
			logNpmBetaSearch(
				context.projectInfo,
				versionSearchParam,
				nexusResult
			)
		),
		taskEither.chain((nexusResult) =>
			func.pipe(
				findMatchingVersion(nexusResult, context.projectInfo.version),
				handleBetaVersionIfFound(
					context,
					npmBumpBetaCommandTypePredicate
				),
				taskEither.fromOption(
					() =>
						new Error(
							'No matching NPM pre-release versions in Nexus'
						)
				)
			)
		),
		taskEither.map((_) => updateBuildContext(context, _))
	);
};

const handleDockerPreReleaseVersion = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const versionSearchParam = prepareVersionSearchParam(
		context.projectInfo.version
	);
	return func.pipe(
		searchForDockerBetas(context.projectInfo.name, versionSearchParam),
		taskEither.chain((nexusResult) =>
			func.pipe(
				findMatchingVersion(nexusResult, context.projectInfo.version),
				handleBetaVersionIfFound(
					context,
					dockerBumpBetaCommandTypePredicate
				),
				taskEither.fromOption(
					() =>
						new Error(
							'No matching Docker pre-release versions in Nexus'
						)
				)
			)
		),
		taskEither.map((_) => updateBuildContext(context, _))
	);
};

const handlePreparingPreReleaseVersionByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
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
			handleMavenPreReleaseVersionFromNexus
		)
		.with(
			{
				projectType: P.when(isGradle),
				projectInfo: P.when(isPreRelease)
			},
			handleMavenPreReleaseVersionFromNexus
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
const isNotTerraformOnly = predicate.not(isTerraformOnly);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isPreRelease(_.projectInfo),
	predicate.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

export const preparePreReleaseVersion: Stage = {
	name: 'Prepare Pre-Release Version',
	execute,
	shouldStageExecute
};
