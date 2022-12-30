import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';

const execute: StageExecuteFn = (context) => TaskEither.right(context);
const shouldStageExecute = () => true;

export const runTerraformScript: Stage = {
	name: 'Run Terraform Script',
	execute,
	shouldStageExecute
};
