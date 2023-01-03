import { Stage, StageExecuteFn } from './Stage';
import * as TaskEither from 'fp-ts/TaskEither';
import * as Pred from 'fp-ts/Predicate';
import { BuildContext } from '../context/BuildContext';
import { pipe } from 'fp-ts/function';
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
import { readTerraformProject } from '../projectCache';
import * as Either from 'fp-ts/Either';
import { TerraformJson } from '../configFileTypes/TerraformJson';
import shellEnv from 'shell-env';

const terraformJsonToVariableString = (json: TerraformJson): string =>
	Object.entries(json)
		.map(([key, value]) => `-var=${key}=${value}`)
		.join(' ');

const getTerraformVariableString = (): Either.Either<Error, string> => {
	if (fs.existsSync(path.join(getCwd(), TERRAFORM_JSON_PATH))) {
		return pipe(
			readTerraformProject(),
			Either.map(terraformJsonToVariableString)
		);
	}
	return Either.right('');
};

const runTerraform = (): TaskEither.TaskEither<Error, string> => {
	const env = shellEnv.sync();
	return pipe(
		getTerraformVariableString(),
		TaskEither.fromEither,
		TaskEither.chain((variableString) =>
			runCommand(`terraform apply -auto-approve ${variableString}`, {
				cwd: path.join(getCwd(), TERRAFORM_DEPLOY_PATH),
				printOutput: true,
				env
			})
		)
	);
};

const handlePromptResult = (
	result: string
): TaskEither.TaskEither<Error, string> =>
	match(result)
		.with('y', runTerraform)
		.otherwise(() => TaskEither.right(''));

const askAndRunTerraform = (): TaskEither.TaskEither<Error, string> =>
	pipe(
		readUserInput('Do you want to execute the terraform script? (y/n): '),
		TaskEither.fromTask,
		TaskEither.chain(handlePromptResult)
	);

const execute: StageExecuteFn = (context) =>
	pipe(
		askAndRunTerraform(),
		TaskEither.map(() => context)
	);
const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isApplication(_.projectType),
	Pred.and((_) => _.hasTerraform)
);

export const runTerraformScript: Stage = {
	name: 'Run Terraform Script',
	execute,
	shouldStageExecute
};
