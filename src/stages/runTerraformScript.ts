import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';
import * as Pred from 'fp-ts/Predicate';
import { BuildContext } from '../context/BuildContext';
import { pipe } from 'fp-ts/function';
import { isApplication } from '../context/projectTypeUtils';

const execute: StageExecuteFn = (context) => TaskEither.right(context);
const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isApplication(_.projectType),
	Pred.and((_) => _.hasTerraform)
);

export const runTerraformScript: Stage = {
	name: 'Run Terraform Script',
	execute,
	shouldStageExecute
};
