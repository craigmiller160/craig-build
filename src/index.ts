#!/usr/bin/env node

import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { program } from 'commander';
import PackageJson from './types/PackageJson';
import fs from 'fs';
import path from 'path';
import deployOnly from './execution/deployOnly';
import ProjectInfo from './types/ProjectInfo';
import buildAndDeploy from './execution/buildAndDeploy';

const projectPackageJson: PackageJson = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8')
);
program
	.version(projectPackageJson.version)
	.option('-b, --build-and-deploy', 'Build and deploy project')
	.option('-d, --deploy-only', 'Only deploy the project')
	.parse(process.argv);

const opts = program.opts();

const findExecution = (): (() => TE.TaskEither<Error, ProjectInfo>) => {
	if (opts.buildAndDeploy) {
		return buildAndDeploy;
	}

	if (opts.deployOnly) {
		return deployOnly;
	}

	throw new Error('No command set');
};

const execution = findExecution();

pipe(
	execution(),
	TE.fold(
		() => process.exit(1),
		() => process.exit(0)
	)
)();
