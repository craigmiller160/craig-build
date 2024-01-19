import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isHelm, isNpm } from '../context/projectTypeUtils';
import { function as func } from 'fp-ts';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import { predicate } from 'fp-ts';
import { isFullBuild } from '../context/commandTypeUtils';
import { readFile } from '../functions/File';
import { getCwd } from '../command/getCwd';
import path from 'path';
import { either } from 'fp-ts';
import { option } from 'fp-ts';
import { parseJson } from '../functions/Json';
import { PackageJson } from '../configFileTypes/PackageJson';
import { NPM_PROJECT_FILE } from '../configFileTypes/constants';
import { logger } from '../logger';
import { ProjectType } from '../context/ProjectType';
import { getNexusCredentials } from '../utils/getNexusCredentials';

export const getNpmPublishCommand = (version: string): string =>
	`npm version --allow-same-version --no-git-tag-version ${version} && npm publish`;

export const CLEAR_FILES_COMMAND = 'git checkout .';

const getPublishDir = (): string =>
	func.pipe(
		readFile(path.resolve(getCwd(), NPM_PROJECT_FILE)),
		either.chain((_) => parseJson<PackageJson>(_)),
		either.map((_) => option.fromNullable(_.publishDirectory)),
		option.fromEither,
		option.flatten,
		option.fold(
			() => getCwd(),
			(_) => path.join(getCwd(), _)
		)
	);

const publishNpmArtifact = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const publishDir = getPublishDir();
	logger.debug(`NPM artifact publish directory: ${publishDir}`);
	logger.debug(
		'To change publish directory, set the "publishDirectory" property in the package.json'
	);
	return func.pipe(
		runCommand(getNpmPublishCommand(context.projectInfo.version), {
			printOutput: true,
			cwd: publishDir
		}),
		taskEither.chain(() => runCommand(CLEAR_FILES_COMMAND)),
		taskEither.map(() => context)
	);
};

const publishHelmArtifact = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		runCommand(
			`helm package ./chart --version ${context.projectInfo.version}`,
			{
				printOutput: true,
				cwd: path.join(getCwd(), 'deploy')
			}
		),
		taskEither.chainEitherK(() => getNexusCredentials()),
		taskEither.chain(({ userName, password }) => {
			const tarFile = path.join(
				getCwd(),
				'deploy',
				`${context.projectInfo.name}-${context.projectInfo.version}.tgz`
			);
			return runCommand(
				`curl -v -u ${userName}:${password} https://nexus.craigmiller160.us/repository/helm-private/ --upload-file ${tarFile}`,
				{
					printOutput: true,
					cwd: path.join(getCwd(), 'deploy')
				}
			);
		}),
		taskEither.map(() => context)
	);

const handlePublishByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isNpm) }, publishNpmArtifact)
		.with({ projectType: P.when(isHelm) }, publishHelmArtifact)
		.run();

const isAnyNpmOrHelmLibrary: predicate.Predicate<ProjectType> = func.pipe(
	isNpm,
	predicate.or((_) => ProjectType.HelmLibrary === _)
);

const execute: StageExecuteFn = (context) => handlePublishByProject(context);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isAnyNpmOrHelmLibrary(_.projectType),
	predicate.and((_) => isFullBuild(_.commandInfo.type))
);

export const manuallyPublishArtifact: Stage = {
	name: 'Manually Publish Artifact',
	execute,
	shouldStageExecute
};
