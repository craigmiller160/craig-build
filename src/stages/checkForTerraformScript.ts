import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';
import { BuildContext } from '../context/BuildContext';
import { isApplication } from '../context/projectTypeUtils';
import fs from 'fs';
import path from 'path';
import { TERRAFORM_DEPLOY_PATH } from '../configFileTypes/constants';
import { getCwd } from '../command/getCwd';
import { logger } from '../logger';

const hasTerraformDirectory = (): boolean => {
	const terraformPath = path.join(getCwd(), TERRAFORM_DEPLOY_PATH);
	logger.debug(
		`Checking for presence of terraform directory: ${terraformPath}`
	);
	return fs.existsSync(terraformPath);
};

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
