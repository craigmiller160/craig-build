import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { runCommand } from '../command/runCommand';
import * as A from 'fp-ts/Array';
import * as P from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { isFullBuild, isKubernetesOnly } from '../context/commandTypeUtils';
import { isDocker } from '../context/projectTypeUtils';

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
		.with({ projectInfo: when(isRelease) }, executeGitTagValidation)
		.run();

const isFullBuildAndReleaseVersion: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isFullBuild(_.commandInfo.type),
	P.and((_) => isRelease(_.projectInfo))
);
const isDockerReleaseProjectNoKubernetesOnly: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isDocker(_.projectType),
	P.and((_) => isRelease(_.projectInfo)),
	P.and(P.not((_) => isKubernetesOnly(_.commandInfo.type)))
);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	isFullBuildAndReleaseVersion,
	P.or(isDockerReleaseProjectNoKubernetesOnly)
);

export const validateGitTag: Stage = {
	name: 'Validate Existing Git Tag',
	execute,
	shouldStageExecute
};
