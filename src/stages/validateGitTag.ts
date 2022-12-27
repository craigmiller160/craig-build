import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, P } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { runCommand } from '../command/runCommand';
import * as A from 'fp-ts/Array';
import * as Pred from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { isFullBuild } from '../context/commandTypeUtils';

const executeGitTagValidation = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		runCommand('git tag'),
		TE.filterOrElse(
			(output) =>
				pipe(
					output.split('\n'),
					A.filter(
						(_) => _.trim() === `v${context.projectInfo.version}`
					)
				).length === 0,
			() =>
				new Error('Git tag for project release version already exists')
		),
		TE.map(() => context)
	);

const handleValidationByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectInfo: P.when(isRelease) }, executeGitTagValidation)
		.run();

const isFullBuildAndReleaseVersion: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isFullBuild(_.commandInfo.type),
	Pred.and((_) => isRelease(_.projectInfo))
);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const shouldStageExecute: Pred.Predicate<BuildContext> =
	isFullBuildAndReleaseVersion;

export const validateGitTag: Stage = {
	name: 'Validate Existing Git Tag',
	execute,
	shouldStageExecute
};
