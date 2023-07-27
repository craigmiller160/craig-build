#!/usr/bin/env node

import { function as func } from 'fp-ts';
import { program } from 'commander';
import { parseJson } from './functions/Json';
import path from 'path';
import { readFile } from './functions/File';
import { either } from 'fp-ts';
import { PackageJson } from './configFileTypes/PackageJson';
import * as EU from './functions/EitherUtils';
import { setupBuildContext } from './setup';
import { execute } from './execute';
import { taskEither } from 'fp-ts';
import { logger } from './logger';
import { task } from 'fp-ts';
import { NPM_PROJECT_FILE } from './configFileTypes/constants';

const packageJson: PackageJson = pipe(
	readFile(path.resolve(__dirname, '..', NPM_PROJECT_FILE)),
	E.chain((_) => parseJson<PackageJson>(_)),
	EU.getOrThrow
);

program
	.version(packageJson.version)
	.option('-b, --full-build', 'Fully build and deploy the project')
	.option(
		'-d, --docker-only',
		'Build and deploy only the Docker image to Kubernetes'
	)
	.option('-k, --kubernetes-only', 'Deploy to Kubernetes only')
	.option(
		'-t, --terraform-only',
		'Run only the Terraform scripts, if present'
	)
	.parse(process.argv);

pipe(
	setupBuildContext(),
	execute,
	TE.fold(
		() => {
			logger.error('Build failed');
			return T.of(1);
		},
		() => {
			logger.info('Build completed');
			return T.of(0);
		}
	)
)().then(process.exit);
