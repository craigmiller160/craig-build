import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';
import { isApplication } from '../context/projectTypeUtils';
import fs from 'fs';
import { TERRAFORM_DEPLOY_PATH } from '../configFileTypes/constants';

const hasTerraformDirectory = (): boolean =>
	fs.existsSync(TERRAFORM_DEPLOY_PATH);

const execute: StageExecuteFn = (context) =>
	TaskEither.right({
		...context,
		hasTerraform: hasTerraformDirectory()
	});
const shouldStageExecute = (context: BuildContext) =>
	isApplication(context.projectType);

export const checkForTerraformScript: Stage = {
	name: 'Check For Terraform Script',
	execute,
	shouldStageExecute
};
