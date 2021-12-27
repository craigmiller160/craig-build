import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as P from 'fp-ts/Predicate';
import { createBuildContext } from '../test/testutils/createBuildContext';

type StageExecuteFn = (
	context: BuildContext
) => TE.TaskEither<Error, BuildContext>;

interface BaseStage {
	name: string;
	execute: StageExecuteFn;
}

interface ConditionalStage extends BaseStage {
	commandAllowsStage: P.Predicate<BuildContext>;
	projectAllowsStage: P.Predicate<BuildContext>;
}

const doRunStage = (stage: ConditionalStage): P.Predicate<BuildContext> => {
	return pipe(stage.commandAllowsStage, P.and(stage.projectAllowsStage));
};

const buildContext: BuildContext = createBuildContext();

const result: boolean = doRunStage({
	name: '',
	execute: () => TE.left(new Error()),
	commandAllowsStage: () => true,
	projectAllowsStage: () => true
})(buildContext);

/*
 * EarlyStages will all always run
 * After that, stage runs will be conditional
 */
