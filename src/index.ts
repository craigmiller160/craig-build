#!/usr/bin/env node

import { pipe } from 'fp-ts/function';
import { program } from 'commander';
import { parseJson } from './functions/parseJson';
import path from 'path';
import { readFile } from './functions/readFile';
import * as E from 'fp-ts/Either';
import PackageJson from './configFileTypes/PackageJson';
import * as EU from './functions/EitherUtils';
import { setupBuildContext } from './setup';
import { execute } from './execute';
import * as TE from 'fp-ts/TaskEither';
import {logger} from './logger';

const packageJson: PackageJson = pipe(
	readFile(path.resolve(__dirname, '..', 'package.json')),
	E.chain((_) => parseJson<PackageJson>(_)),
	EU.getOrThrow
);

program
	.version(packageJson.version)
	.option('-b, --full-build', 'Fully build and deploy the project')
	.option('-d, --docker-only', 'Build and deploy only the Docker image')
	.option('-k, --kubernetes-only', 'Deploy to Kubernetes only')
	.parse(process.argv);

pipe(
	setupBuildContext(program.opts()),
	execute,
	TE.fold(
		() => {
			logger.error('Build failed');
			process.exit(1);
		},
		() => {
			logger.info('Build completed');
			process.exit(0);
		}
	)
)();
