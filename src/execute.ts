import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { Stage } from './stages/Stage';
import { getCommandInfo } from './stages/getCommandInfo';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

const stages: Stage[] = [getCommandInfo];

const executeStage = (
	contextTE: TE.TaskEither<Error, BuildContext>,
	stage: Stage
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		contextTE,
		// TODO pre-logging
		TE.chain((context) => stage(context))
		// TODO post-logging
		// TODO log error
	);

export const execute = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		stages,
		A.reduce(
			TE.right<Error, BuildContext>(context),
			(ctxTE, stage: Stage) => executeStage(ctxTE, stage)
		)
	);
