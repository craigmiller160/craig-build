import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { function as func } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { runCommand } from '../command/runCommand';
import { array } from 'fp-ts';
import { predicate } from 'fp-ts';
import { Stage, StageExecuteFn } from './Stage';
import { isFullBuild } from '../context/commandTypeUtils';

const executeGitTagValidation = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	func.pipe(
		runCommand('git tag'),
		taskEither.filterOrElse(
			(output) =>
				func.pipe(
					output.split('\n'),
					array.filter(
						(_) => _.trim() === `v${context.projectInfo.version}`
					)
				).length === 0,
			() =>
				new Error('Git tag for project release version already exists')
		),
		taskEither.map(() => context)
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
