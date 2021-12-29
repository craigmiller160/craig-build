import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { isRelease } from '../context/projectInfoUtils';
import { runCommand } from '../command/runCommand';
import * as A from 'fp-ts/Array';
import * as P from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import {
	isDockerOnly,
	isFullBuild,
	isKubernetesOnly
} from '../context/commandTypeUtils';

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

const isFullBuildOrDockerOnly: P.Predicate<CommandType> = pipe(
	isFullBuild,
	P.or(isDockerOnly)
);

const execute: StageExecuteFn = (context) => handleValidationByProject(context);
const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isRelease(_.projectInfo),
	P.and((_) => isFullBuildOrDockerOnly(_.commandInfo.type))
);

export const validateGitTag: Stage = {
	name: 'Validate Existing Git Tag',
	execute,
	shouldStageExecute
};
