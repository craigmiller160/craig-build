import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { Stage } from './stages/Stage';
import { getCommandInfo } from './stages/getCommandInfo';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import {logger} from './logger';
import {STAGES} from './stages';

const executeStage = (
	contextTE: TE.TaskEither<Error, BuildContext>,
	stage: Stage
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		contextTE,
		TE.chain((context) => {
			logger.info(`Starting stage: ${stage.name}`);
			return pipe(
				stage(context),
				TE.map((_) => {
					logger.info(`Completed stage: ${stage.name}`);
					return _;
				}),
				TE.mapLeft((_) => {
					logger.error(`Error in stage: ${stage.name}`);
					logger.error(_);
					return _;
				})
			);
		})
	);

export const execute = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	pipe(
		STAGES,
		A.reduce(
			TE.right<Error, BuildContext>(context),
			(ctxTE, stage: Stage) => executeStage(ctxTE, stage)
		)
	);
