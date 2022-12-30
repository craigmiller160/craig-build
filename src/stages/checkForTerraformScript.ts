import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';
import { isApplication } from '../context/projectTypeUtils';
import fs from 'fs';
import path from 'path';
import { TERRAFORM_DEPLOY_PATH } from '../configFileTypes/constants';
import { getCwd } from '../command/getCwd';

const hasTerraformDirectory = (): boolean =>
	fs.existsSync(path.join(getCwd(), TERRAFORM_DEPLOY_PATH));

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
