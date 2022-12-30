import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';

const execute: StageExecuteFn = (context) => TaskEither.right(context);
const shouldStageExecute = () => false;

export const checkForTerraformScript: Stage = {
	name: 'Check For Terraform Script',
	execute,
	shouldStageExecute
};
