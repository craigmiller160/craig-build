/* eslint-disable */
import { BuildContext } from './context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { createBuildContext } from '../test/testutils/createBuildContext';
import { pipe } from 'fp-ts/function';
import { match, when } from 'ts-pattern';
import { Stage } from './stages/Stage';

export {};

enum StageStatus {
	PROCEED = 'PROCEED',
	SKIP_FOR_COMMAND = 'SKIP_FOR_COMMAND',
	SKIP_FOR_PROJECT = 'SKIP_FOR_PROJECT'
}

interface ConditionalStageExecution {
	readonly status: StageStatus;
	readonly stage: Stage;
	readonly context: BuildContext;
}

const of = (
	stage: Stage,
	context: BuildContext
): ConditionalStageExecution => ({
	stage,
	context,
	status: StageStatus.PROCEED
});

const theContext = createBuildContext();

const stage: Stage = {
	name: '',
	execute: () => TE.right(theContext),
	commandAllowsStage: () => true,
	projectAllowsStage: () => true
};

interface Container {
	stage: Stage;
	context: BuildContext;
	status: StageStatus;
}

const createContainer = (stage: Stage, context: BuildContext): Container => ({
	stage,
	context,
	status: StageStatus.PROCEED
});

const testCommandAllowsStage = (container: Container): Container =>
	match(container)
		.with(
			{
				stage: when((stage) => stage.commandAllowsStage(theContext))
			},
			(_) => _
		)
		.otherwise((_) => ({
			..._,
			status: StageStatus.SKIP_FOR_COMMAND
		}));

const testProjectAllowsStage = (container: Container): Container =>
	match(container)
		.with({ status: StageStatus.SKIP_FOR_COMMAND }, (_) => _)
		.with(
			{
				status: StageStatus.PROCEED,
				stage: when((stage) => stage.projectAllowsStage(theContext))
			},
			(_) => _
		)
		.otherwise((_) => ({
			..._,
			status: StageStatus.SKIP_FOR_PROJECT
		}));

const executeStage = (
	container: Container
): TE.TaskEither<Error, BuildContext> =>
	match(container)
		.with({ status: StageStatus.PROCEED }, ({ stage, context }) =>
			stage.execute(context)
		)
		.otherwise(({ context, status }) => {
			console.log('Skipping', status);
			return TE.right(context);
		});

pipe(
	createContainer(stage, theContext),
	testCommandAllowsStage,
	testProjectAllowsStage,
	executeStage
);
