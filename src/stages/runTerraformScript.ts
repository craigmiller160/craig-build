import { Stage, StageExecuteFn } from './Stage';
import { predicate, taskEither } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';
import { function as func } from 'fp-ts';
import { isApplication } from '../context/projectTypeUtils';
import { readUserInput } from '../utils/readUserInput';
import path from 'path';
import { getCwd } from '../command/getCwd';
import {
	TERRAFORM_DEPLOY_PATH,
	TERRAFORM_JSON_PATH
} from '../configFileTypes/constants';
import { runCommand } from '../command/runCommand';
import { match } from 'ts-pattern';
import fs from 'fs';
import { readTerraformProject } from '../projectReading';
import { either } from 'fp-ts';
import { TerraformJson } from '../configFileTypes/TerraformJson';
import shellEnv from 'shell-env';
import { logger } from '../logger';

const HAS_NO_CHANGES =
	/.*No changes\..*Your infrastructure matches the configuration\..*/;

const terraformJsonToVariableString = (json: TerraformJson): string =>
	Object.entries(json)
		.map(([key, value]) => `-var=${key}=${value}`)
		.join(' ');

const getTerraformVariableString = (): either.Either<Error, string> => {
	if (fs.existsSync(path.join(getCwd(), TERRAFORM_JSON_PATH))) {
		return func.pipe(
			readTerraformProject(),
			either.map(terraformJsonToVariableString)
		);
	}
	return either.right('');
};

const applyTerraform = (
	variableString: string
): taskEither.TaskEither<Error, string> => {
	const env = shellEnv.sync();
	return runCommand(`terraform apply -auto-approve ${variableString}`, {
		cwd: path.join(getCwd(), TERRAFORM_DEPLOY_PATH),
		printOutput: true,
		env
	});
};
const planTerraform = (
	variableString: string
): taskEither.TaskEither<Error, string> => {
	const env = shellEnv.sync();
	return runCommand(`terraform plan ${variableString}`, {
		cwd: path.join(getCwd(), TERRAFORM_DEPLOY_PATH),
		printOutput: true,
		env
	});
};

type PromptResultArgs = {
	readonly variableString: string;
	readonly promptResult: string;
};
const handlePromptResult = ({
	variableString,
	promptResult
}: PromptResultArgs): taskEither.TaskEither<Error, string> =>
	match(promptResult)
		.with('y', () => applyTerraform(variableString))
		.otherwise(() => taskEither.right(''));

const promptAndRunIfChanges = (
	planOutput: string,
	variableString: string
): taskEither.TaskEither<Error, string> => {
	if (HAS_NO_CHANGES.test(planOutput)) {
		logger.debug('No terraform changes to apply');
		return taskEither.right('');
	}

	return func.pipe(
		taskEither.fromTask<string, Error>(
			readUserInput(
				'Do you want to execute the terraform script? (y/n): '
			)
		),
		taskEither.chain((promptResult) =>
			handlePromptResult({ promptResult, variableString })
		)
	);
};

const askAndRunTerraform = (): taskEither.TaskEither<Error, string> =>
	func.pipe(
		getTerraformVariableString(),
		taskEither.fromEither,
		taskEither.bindTo('variableString'),
		taskEither.bind('planOutput', ({ variableString }) =>
			planTerraform(variableString)
		),
		taskEither.chain(({ planOutput, variableString }) =>
			promptAndRunIfChanges(planOutput, variableString)
		)
	);

const execute: StageExecuteFn = (context) =>
	func.pipe(
		askAndRunTerraform(),
		taskEither.map(() => context)
	);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isApplication(_.projectType),
	predicate.and((_) => _.hasTerraform)
);

export const runTerraformScript: Stage = {
	name: 'Run Terraform Script',
	execute,
	shouldStageExecute
};
