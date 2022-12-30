import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';
import { isApplication } from '../context/projectTypeUtils';

const execute: StageExecuteFn = (context) => TaskEither.right(context);
const shouldStageExecute = (context: BuildContext) =>
	isApplication(context.projectType);

export const checkForTerraformScript: Stage = {
	name: 'Check For Terraform Script',
	execute,
	shouldStageExecute
};
