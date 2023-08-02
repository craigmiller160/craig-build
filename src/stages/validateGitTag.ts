import { BuildContext } from '../context/BuildContext';
import {
	function as func,
	option,
	predicate,
	readonlyArray,
	string,
	taskEither
} from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import { isFullBuild } from '../context/commandTypeUtils';
import { readUserInput } from '../utils/readUserInput';

const handleFoundVersion =
	(context: BuildContext) =>
	(version: string): taskEither.TaskEither<Error, BuildContext> =>
		func.pipe(
			readUserInput(
				`A git tag with version ${version} already exists. Do you want to proceed and skip tagging? (y/n): `
			),
			taskEither.fromTask,
			taskEither.filterOrElse(
				(answer) => 'y' === answer.trim().toLowerCase(),
				() =>
					new Error(
						`Git tag for project version ${version} already exists`
					)
			),
			taskEither.map(
				(): BuildContext => ({
					...context,
					doGitTag: false
				})
			)
		);

const handleTagResult =
	(context: BuildContext) =>
	(gitTagOutput: string): taskEither.TaskEither<Error, BuildContext> =>
		func.pipe(
			gitTagOutput,
			string.split('\n'),
			readonlyArray.findFirst(
				(_) => _.trim() === `v${context.projectInfo.version}`
			),
			option.fold(
				() => taskEither.right(context),
				handleFoundVersion(context)
			)
		);

const executeGitTagValidation = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		runCommand('git tag'),
		taskEither.chain(handleTagResult(context))
	);

const handleValidationByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectInfo: P.when(isRelease) }, executeGitTagValidation)
		.run();

const isFullBuildAndReleaseVersion: predicate.Predicate<BuildContext> =
	func.pipe(
		(_: BuildContext) => isFullBuild(_.commandInfo.type),
		predicate.and((_) => isRelease(_.projectInfo))
	);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const shouldStageExecute: predicate.Predicate<BuildContext> =
	isFullBuildAndReleaseVersion;

export const validateGitTag: Stage = {
	name: 'Validate Existing Git Tag',
	execute,
	shouldStageExecute
};
